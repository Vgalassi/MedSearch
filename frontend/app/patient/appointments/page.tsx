"use client";

import { API_BASE_URL, FIXED_PATIENT_ID } from "@/components/appConfig";
import { AppointmentList } from "@/components/AppointmentList";
import { AppointmentDetails } from "@/components/types/Appointment";
import { useEffect, useState } from "react";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      if (!FIXED_PATIENT_ID) {
        setError("Configure NEXT_PUBLIC_FIXED_PATIENT_ID para listar consultas.");
        setIsFetching(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments/patient/${FIXED_PATIENT_ID}/details`,
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
  }, []);

  return (
    <main className="page-shell">
      <div className="content-shell">
        <section className="rounded-lg bg-teal-950 px-6 py-8 text-white shadow-lg shadow-slate-200/70 sm:px-8">
          <p className="section-kicker text-teal-200">Minhas consultas</p>
          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold">Sua agenda</h1>
              <p className="mt-3 max-w-2xl leading-7 text-teal-50/80">
                Acompanhe suas consultas marcadas 
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
              emptyText="Voce ainda nao possui consultas agendadas."
              mode="patient"
            />
          </section>
        )}
      </div>
    </main>
  );
}
