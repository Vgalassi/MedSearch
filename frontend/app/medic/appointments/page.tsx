"use client";

import { API_BASE_URL } from "@/components/appConfig";
import { AppointmentList } from "@/components/AppointmentList";
import { AppointmentDetails } from "@/components/types/Appointment";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function MedicAppointmentsPage() {
  const { user, loading } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    async function fetchAppointments() {
      try {
        const doctorId = user?.role === "DOCTOR" ? user.profileId : null;

        if (!doctorId) {
          throw new Error("Entre como medico para carregar sua agenda");
        }

        const response = await fetch(
          `${API_BASE_URL}/appointments/doctor/${doctorId}/details`,
          {
            credentials: "include",
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message ?? "Nao foi possivel carregar consultas");
        }

        setAppointments(data.appointments ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setIsFetching(false);
      }
    }

    fetchAppointments();
  }, [loading, user]);

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Consultas medicas</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">Agenda do medico</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Veja os pacientes agendados e horarios das suas consultas
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

        {!isFetching && !error && (
          <section className="mt-8">
            <AppointmentList
              appointments={appointments}
              emptyText="Nenhuma consulta encontrada para este medico."
              mode="doctor"
            />
          </section>
        )}
      </div>
    </main>
  );
}
