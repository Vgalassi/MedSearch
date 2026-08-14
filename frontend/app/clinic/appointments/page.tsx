"use client";

import { API_BASE_URL } from "@/components/appConfig";
import { AppointmentList } from "@/components/AppointmentList";
import { specialityLabel } from "@/components/constants/specialities";
import { AppointmentDetails } from "@/components/types/Appointment";
import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useMemo, useState } from "react";

type DoctorGroup = {
  doctorId: string;
  doctorName: string;
  speciality: string;
  appointments: AppointmentDetails[];
};

export default function ClinicAppointmentsPage() {
  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clinicId = user?.role === "CLINIC" ? user.profileId : null;

  const loadAppointments = useCallback(async () => {
    if (!clinicId) {
      setError("Entre como clínica para visualizar as consultas.");
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/clinic/${clinicId}/details`,
        { credentials: "include" },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Não foi possível carregar consultas");
      }

      setAppointments(data.appointments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setIsFetching(false);
    }
  }, [clinicId]);

  useEffect(() => {
    if (loading) return;
    // A busca assíncrona sincroniza a tela com a sessão autenticada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAppointments();
  }, [loading, loadAppointments]);

  const groupedByDoctor = useMemo(() => {
    const groups = new Map<string, DoctorGroup>();

    for (const appointment of appointments) {
      const existing = groups.get(appointment.doctorId);

      if (existing) {
        existing.appointments.push(appointment);
        continue;
      }

      groups.set(appointment.doctorId, {
        doctorId: appointment.doctorId,
        doctorName: appointment.doctor.name,
        speciality: appointment.doctor.speciality,
        appointments: [appointment],
      });
    }

    return Array.from(groups.values()).sort((a, b) =>
      a.doctorName.localeCompare(b.doctorName, "pt-BR"),
    );
  }, [appointments]);

  async function cancelAppointment(appointmentId: string) {
    const response = await fetch(
      `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
      {
        method: "PATCH",
        credentials: "include",
      },
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "Não foi possível cancelar a consulta");
    }

    await loadAppointments();
  }

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Painel da clínica</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">Consultas da clínica</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Visualize as consultas agendadas de todos os médicos vinculados
                à sua clínica, organizadas por profissional.
              </p>
            </div>
            <span className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-teal-50">
              {appointments.length} consultas
            </span>
          </div>
        </section>

        {isFetching && (
          <p className="mt-8 rounded-md border border-teal-100 bg-teal-50 px-4 py-3 text-teal-800">
            Carregando consultas...
          </p>
        )}

        {error && (
          <p className="mt-8 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </p>
        )}

        {!isFetching && !error && groupedByDoctor.length === 0 && (
          <div className="surface mt-8 p-8 text-center text-slate-600">
            Nenhuma consulta encontrada para os médicos desta clínica.
          </div>
        )}

        {!isFetching && !error && groupedByDoctor.length > 0 && (
          <section className="mt-8 space-y-10">
            {groupedByDoctor.map((group) => (
              <div key={group.doctorId}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="section-kicker">
                      {specialityLabel(group.speciality)}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">
                      {group.doctorName}
                    </h2>
                  </div>
                  <span className="rounded-md bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
                    {group.appointments.length}{" "}
                    {group.appointments.length === 1 ? "consulta" : "consultas"}
                  </span>
                </div>

                <div className="mt-5">
                  <AppointmentList
                    appointments={group.appointments}
                    emptyText="Nenhuma consulta para este médico."
                    mode="clinic"
                    onCancel={cancelAppointment}
                  />
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
