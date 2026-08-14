"use client";

import Link from "next/link";
import { useState } from "react";
import { specialityLabel } from "./constants/specialities";
import { AppointmentDetails } from "./types/Appointment";

type AppointmentListProps = {
  appointments: AppointmentDetails[];
  emptyText: string;
  mode: "patient" | "doctor" | "clinic";
  onCancel?: (appointmentId: string) => Promise<void>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    SCHEDULED: "Agendada", CANCELED: "Cancelada", COMPLETED: "Concluída",
    NO_SHOW: "Não compareceu", OCURRING: "Em andamento",
  };
  return labels[status] ?? status;
}

export function AppointmentList({ appointments, emptyText, mode, onCancel }: AppointmentListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleCancel(appointmentId: string) {
    if (!onCancel || !window.confirm("Deseja realmente cancelar esta consulta?")) return;
    setCancelingId(appointmentId);
    setCancelError(null);
    try {
      await onCancel(appointmentId);
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : "Não foi possível cancelar a consulta.");
    } finally {
      setCancelingId(null);
    }
  }

  if (appointments.length === 0) return <div className="surface p-8 text-center text-slate-600">{emptyText}</div>;

  return (
    <div className="space-y-4">
      {cancelError && <p className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{cancelError}</p>}
      {appointments.map((appointment) => (
        <article className="surface grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr_auto] lg:items-center" key={appointment.id}>
          <div>
            <p className="text-sm font-semibold text-teal-700">{formatDate(appointment.day)} às {appointment.startTime}</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">{mode === "patient" ? appointment.doctor.name : appointment.patient.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{mode === "patient" ? specialityLabel(appointment.doctor.speciality) : appointment.patient.phone}</p>
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{appointment.clinic?.name ?? "Clínica não vinculada"}</p>
            <p className="mt-1">{appointment.clinic?.address ?? "Atendimento particular"}</p>
            <p className="mt-1">{appointment.startTime} - {appointment.endTime}</p>
            <p className="mt-1 font-semibold text-slate-800">{appointment.type === "ONLINE" ? "Online" : "Presencial"}</p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="inline-flex justify-center rounded-md bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">{statusLabel(appointment.status)}</span>
            {appointment.type === "ONLINE" && appointment.status === "SCHEDULED" && <Link className="btn-primary px-4 py-2" href={`/call/${appointment.id}`}>Entrar na videochamada</Link>}
            {onCancel && appointment.status === "SCHEDULED" && (
              <button className="btn-danger px-4 py-2" disabled={cancelingId === appointment.id} onClick={() => void handleCancel(appointment.id)} type="button">
                {cancelingId === appointment.id ? "Cancelando..." : "Cancelar consulta"}
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
