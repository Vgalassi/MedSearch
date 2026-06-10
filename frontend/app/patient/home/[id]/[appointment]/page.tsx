"use client";

import { API_BASE_URL } from "@/components/appConfig";
import { Doctor } from "@/components/types/Doctor";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type SchedulingResponse = {
  settings: {
    defaultDuration: string;
  } | null;
};

type AppointmentType = "ONLINE" | "OFFLINE";
type AvailabilityMode = AppointmentType | "BOTH";

type AvailableHour = {
  startTime: string;
  endTime: string;
  mode: AvailabilityMode;
};

const modeLabels: Record<AvailabilityMode, string> = {
  ONLINE: "Online",
  OFFLINE: "Presencial",
  BOTH: "Ambas",
};

const typeLabels: Record<AppointmentType, string> = {
  ONLINE: "Online",
  OFFLINE: "Presencial",
};

function dateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDay(value: string, lenght: "short" | "long" | "narrow" | undefined) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: lenght,
    day: "2-digit",
    timeZone: "UTC"
  }).format(new Date(value));
}

function monthLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function addDuration(time: string, duration: string) {
  const [hour, minute] = time.split(":").map(Number);
  const [durationHour, durationMinute] = duration.split(":").map(Number);
  const totalMinutes =
    (hour ?? 0) * 60 +
    (minute ?? 0) +
    (durationHour ?? 0) * 60 +
    (durationMinute ?? 0);
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
    2,
    "0",
  )}`;
}

export default function AppointmentPage() {
  const params = useParams<{ id: string; appointment: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const doctorId = params?.appointment;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [days, setDays] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [hours, setHours] = useState<AvailableHour[]>([]);
  const [selectedHour, setSelectedHour] = useState<AvailableHour | null>(null);
  const [selectedType, setSelectedType] = useState<AppointmentType>("OFFLINE");
  const [defaultDuration, setDefaultDuration] = useState("00:30");
  const [isFetchingDays, setIsFetchingDays] = useState(true);
  const [isFetchingHours, setIsFetchingHours] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId || loading) return;

    async function fetchInitialData() {
      try {
        const [doctorsResponse, daysResponse, schedulingResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/doctors/all`),
            fetch(`${API_BASE_URL}/doctors/days/${doctorId}`, {
              credentials: "include",
            }),
            fetch(`${API_BASE_URL}/doctors/${doctorId}/scheduling`),
          ]);

        const doctorsData = await doctorsResponse.json();
        const daysData = await daysResponse.json();
        const schedulingData =
          (await schedulingResponse.json()) as SchedulingResponse;

        if (!daysResponse.ok) {
          throw new Error(daysData.message ?? "Nao foi possivel carregar dias");
        }

        setDoctor(
          doctorsData.doctors?.find((item: Doctor) => item.id === doctorId) ??
            null,
        );
        setDays(daysData.days ?? []);
        setDefaultDuration(schedulingData.settings?.defaultDuration ?? "00:30");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setIsFetchingDays(false);
      }
    }

    fetchInitialData();
  }, [doctorId, loading]);

  useEffect(() => {
    if (!doctorId || !selectedDay) return;
    const day = selectedDay;

    async function fetchHours() {
      setIsFetchingHours(true);
      setError(null);
      setSelectedHour(null);
      setSelectedType("OFFLINE");

      try {
        const response = await fetch(
          `${API_BASE_URL}/doctors/days/hours/${doctorId}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateKey(day) }),
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Nao foi possivel carregar horarios");
        }

        setHours(data.hours ?? []);
      } catch (err) {
        setHours([]);
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setIsFetchingHours(false);
      }
    }

    fetchHours();
  }, [doctorId, selectedDay]);

  const groupedDays = useMemo(() => {
    return days.reduce<Record<string, string[]>>((groups, day) => {
      const key = monthLabel(day);
      groups[key] = [...(groups[key] ?? []), day];
      return groups;
    }, {});
  }, [days]);

  async function createAppointment() {
    if (!doctorId || !selectedDay || !selectedHour) return;
    if (loading) return;
    if (user?.role !== "PATIENT" || !user.profileId) {
      setError("Entre como paciente para criar consultas.");
      setSelectedHour(null);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          startTime: selectedHour.startTime,
          endTime: selectedHour.endTime ?? addDuration(selectedHour.startTime, defaultDuration),
          day: dateKey(selectedDay),
          reason: "Consulta agendada pelo paciente",
          notes: null,
          type: selectedType,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Nao foi possivel criar a consulta");
      }

      router.push("/patient/appointments");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setIsCreating(false);
      setSelectedHour(null);
    }
  }

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Nova consulta</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">
                {doctor?.name ?? "Escolha um horario"}
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Selecione um dia disponível e confirme o melhor horário para
                concluir o agendamento.
              </p>
            </div>
            {doctor && (
              <span className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-teal-50">
                {doctor.speciality}
              </span>
            )}
          </div>
        </section>

        {error && (
          <p className="mt-8 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="section-kicker">Dias disponíveis</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">
                  Selecione o dia para consulta
                </h2>
              </div>
            </div>

            {isFetchingDays && (
              <p className="mt-5 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
                Carregando dias...
              </p>
            )}

            {!isFetchingDays && days.length === 0 && (
              <div className="surface mt-5 p-8 text-center text-slate-600">
                Nenhum dia disponível para este médico.
              </div>
            )}

            <div className="mt-5 space-y-5">
              {Object.entries(groupedDays).map(([month, monthDays]) => (
                <div className="surface p-5" key={month}>
                  <h3 className="text-lg font-bold capitalize text-slate-950">
                    {month}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {monthDays.map((day) => (
                      <button
                        className={`rounded-md border px-4 py-3 text-left text-sm font-semibold transition cursor-pointer ${
                          selectedDay === day
                            ? "border-teal-700 bg-teal-700 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                        }`}
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        type="button"
                      >
                        {formatDay(day,"short")}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="surface p-5">
            <p className="section-kicker">Horários</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">
              {selectedDay ? formatDay(selectedDay,"long") : "Selecione um dia"}
            </h2>

            {isFetchingHours && (
              <p className="mt-5 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
                Carregando horários...
              </p>
            )}

            {!isFetchingHours && selectedDay && hours.length === 0 && (
              <p className="mt-5 text-sm text-slate-600">
                Nenhum horário disponível para este dia.
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              {hours.map((hour,index) => (
                <button
                  className={`rounded-md border px-4 py-3 text-left transition cursor-pointer ${
                    selectedHour?.startTime === hour.startTime
                      ? "border-teal-700 bg-teal-700 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50"
                  }`}
                  key={index}
                  onClick={() => {
                    setSelectedHour(hour);
                    setSelectedType(hour.mode === "ONLINE" ? "ONLINE" : "OFFLINE");
                  }}
                  type="button"
                >
                  <span className="block text-sm font-bold">{hour.startTime}</span>
                  <span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                    hour.mode === "ONLINE"
                      ? "bg-sky-50 text-sky-700"
                      : hour.mode === "OFFLINE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    {modeLabels[hour.mode]}
                  </span>
                </button>
              ))}
            </div>
          </aside>
        </section>

        {selectedHour && selectedDay && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
            <div className="surface w-full max-w-md p-6 shadow-xl">
              <p className="section-kicker">Confirmar consulta</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                Agendar para {selectedHour.startTime}?
              </h2>
              <p className="mt-3 text-slate-600">
                A consulta sera criada para {formatDay(selectedDay,"long")} com{" "}
                {doctor?.name ?? "este medico"}.
              </p>
              {selectedHour.mode === "BOTH" ? (
                <label className="mt-5 block">
                  <span className="label">Tipo de consulta</span>
                  <select
                    className="input"
                    onChange={(event) =>
                      setSelectedType(event.target.value as AppointmentType)
                    }
                    value={selectedType}
                  >
                    <option value="OFFLINE">Presencial</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </label>
              ) : (
                <p className="mt-5 inline-flex rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                  {typeLabels[selectedType]}
                </p>
              )}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  className="btn-secondary cursor-pointer"
                  onClick={() => setSelectedHour(null)}
                  type="button"
                >
                  Voltar
                </button>
                <button
                  className="btn-primary cursor-pointer"
                  disabled={isCreating}
                  onClick={createAppointment}
                  type="button"
                >
                  {isCreating ? "Agendando..." : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
