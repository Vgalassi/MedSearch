"use client";

import { API_BASE_URL, FIXED_DOCTOR_ID } from "@/components/appConfig";
import { FormEvent, useEffect, useState } from "react";

const WEEKDAYS = [
  { value: "MONDAY", label: "Seg" },
  { value: "TUESDAY", label: "Ter" },
  { value: "WEDNESDAY", label: "Qua" },
  { value: "THURSDAY", label: "Qui" },
  { value: "FRIDAY", label: "Sex" },
  { value: "SATURDAY", label: "Sab" },
  { value: "SUNDAY", label: "Dom" },
];

type SettingsForm = {
  isAvaliable: boolean;
  defaultDuration: string;
  bufferBetween: string;
  advanceBookingHours: number;
  maxSchedulingDays: number;
  maxDailyAppointments: number | "";
};

type AvailabilityForm = {
  weekdays: string[];
  startTime: string;
  endTime: string;
};

const defaultSettings: SettingsForm = {
  isAvaliable: true,
  defaultDuration: "00:30",
  bufferBetween: "00:10",
  advanceBookingHours: 24,
  maxSchedulingDays: 90,
  maxDailyAppointments: "",
};

const defaultAvailability: AvailabilityForm = {
  weekdays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  startTime: "08:00",
  endTime: "17:30",
};

export default function MedicAppointmentConfigPage() {
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);
  const [availabilities, setAvailabilities] = useState<AvailabilityForm[]>([
    defaultAvailability,
  ]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDoctorId, setActiveDoctorId] = useState(FIXED_DOCTOR_ID);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchScheduling() {
      try {
        let doctorId = FIXED_DOCTOR_ID;
        if (!doctorId) {
          const doctorsResponse = await fetch(`${API_BASE_URL}/doctors/all`);
          const doctorsData = await doctorsResponse.json();
          doctorId = doctorsData.doctors?.[0]?.id ?? "";
        }

        if (!doctorId) {
          throw new Error("Nenhum medico encontrado para configurar agenda");
        }

        setActiveDoctorId(doctorId);
        const response = await fetch(
          `${API_BASE_URL}/doctors/${doctorId}/scheduling`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Nao foi possivel carregar agenda");
        }

        if (data.settings) {
          setSettings({
            isAvaliable: data.settings.isAvaliable,
            defaultDuration: data.settings.defaultDuration,
            bufferBetween: data.settings.bufferBetween,
            advanceBookingHours: data.settings.advanceBookingHours,
            maxSchedulingDays: data.settings.maxSchedulingDays,
            maxDailyAppointments: data.settings.maxDailyAppointments ?? "",
          });
        }

        setAvailabilities(
          data.availabilities?.length
            ? data.availabilities.map((item: AvailabilityForm) => ({
                weekdays: item.weekdays,
                startTime: item.startTime,
                endTime: item.endTime,
              }))
            : [defaultAvailability],
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setIsFetching(false);
      }
    }

    fetchScheduling();
  }, []);

  function updateAvailability(
    index: number,
    nextAvailability: AvailabilityForm,
  ) {
    setAvailabilities((current) =>
      current.map((availability, currentIndex) =>
        currentIndex === index ? nextAvailability : availability,
      ),
    );
  }

  function toggleWeekday(index: number, weekday: string) {
    const availability = availabilities[index];
    if (!availability) return;

    const weekdays = availability.weekdays.includes(weekday)
      ? availability.weekdays.filter((item) => item !== weekday)
      : [...availability.weekdays, weekday];

    updateAvailability(index, { ...availability, weekdays });
  }

  async function saveScheduling(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!activeDoctorId) {
        throw new Error("Nenhum medico selecionado para salvar");
      }

      const response = await fetch(
        `${API_BASE_URL}/doctors/${activeDoctorId}/scheduling`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings: {
              ...settings,
              maxDailyAppointments:
                settings.maxDailyAppointments === ""
                  ? null
                  : Number(settings.maxDailyAppointments),
            },
            availabilities,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Nao foi possivel salvar");
      }

      setMessage("Configuracoes salvas com sucesso.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Configuracao</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">Agenda do medico</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Ajuste disponibilidade, duracão padrão e limites de
                agendamento.
              </p>
            </div>
            <span className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-teal-50">
              {availabilities.length} janelas
            </span>
          </div>
        </section>

        {isFetching && (
          <p className="mt-8 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            Carregando configurações...
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-8 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            {message}
          </p>
        )}

        {!isFetching && (
          <form className="mt-8 space-y-6" onSubmit={saveScheduling}>
            <section className="surface p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="section-kicker">Regras</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Configurações gerais
                  </h2>
                </div>
                <label className="inline-flex items-center gap-3 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  <input
                    checked={settings.isAvaliable}
                    className="size-4 accent-teal-700"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        isAvaliable: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  Liberar consultas
                </label>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label>
                  <span className="label">Duração padrão</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        defaultDuration: event.target.value,
                      }))
                    }
                    type="time"
                    value={settings.defaultDuration}
                  />
                </label>
                <label>
                  <span className="label">Intervalo entre consultas</span>
                  <input
                    className="input"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        bufferBetween: event.target.value,
                      }))
                    }
                    type="time"
                    value={settings.bufferBetween}
                  />
                </label>
                <label>
                  <span className="label">Dias futuros para agendar</span>
                  <input
                    className="input"
                    min={1}
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        maxSchedulingDays: Number(event.target.value),
                      }))
                    }
                    type="number"
                    value={settings.maxSchedulingDays}
                  />
                </label>
                
              </div>
            </section>

            <section>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="section-kicker">Disponibilidades</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">
                    Janelas de atendimento
                  </h2>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() =>
                    setAvailabilities((current) => [
                      ...current,
                      defaultAvailability,
                    ])
                  }
                  type="button"
                >
                  Adicionar janela
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {availabilities.map((availability, index) => (
                  <article className="surface p-5" key={index}>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <h3 className="text-lg font-bold text-slate-950">
                        Janela {index + 1}
                      </h3>
                      {availabilities.length > 1 && (
                        <button
                          className="btn-danger"
                          onClick={() =>
                            setAvailabilities((current) =>
                              current.filter((_, currentIndex) => currentIndex !== index),
                            )
                          }
                          type="button"
                        >
                          Remover
                        </button>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {WEEKDAYS.map((weekday) => (
                        <button
                          className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                            availability.weekdays.includes(weekday.value)
                              ? "border-teal-700 bg-teal-700 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-teal-50"
                          }`}
                          key={weekday.value}
                          onClick={() => toggleWeekday(index, weekday.value)}
                          type="button"
                        >
                          {weekday.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label>
                        <span className="label">Horario de inicio</span>
                        <input
                          className="input"
                          onChange={(event) =>
                            updateAvailability(index, {
                              ...availability,
                              startTime: event.target.value,
                            })
                          }
                          type="time"
                          value={availability.startTime}
                        />
                      </label>
                      <label>
                        <span className="label">Horario de saida</span>
                        <input
                          className="input"
                          onChange={(event) =>
                            updateAvailability(index, {
                              ...availability,
                              endTime: event.target.value,
                            })
                          }
                          type="time"
                          value={availability.endTime}
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="flex justify-end">
              <button className="btn-primary" disabled={isSaving} type="submit">
                {isSaving ? "Salvando..." : "Salvar configuracoes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
