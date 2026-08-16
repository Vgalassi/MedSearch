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
  onSaveNotes?: (appointmentId: string, notes: string) => Promise<void>;
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

export function AppointmentList({ appointments, emptyText, mode, onCancel, onSaveNotes }: AppointmentListProps) {
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [notesAppointment, setNotesAppointment] = useState<AppointmentDetails | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [viewingNotes, setViewingNotes] = useState<AppointmentDetails | null>(null);

  function openNotes(appointment: AppointmentDetails) {
    setNotesAppointment(appointment);
    setNotesValue(appointment.notes ?? "");
    setNotesError(null);
  }

  async function saveNotes() {
    if (!notesAppointment || !onSaveNotes || !notesValue.trim()) return;
    setSavingNotes(true);
    setNotesError(null);
    try {
      await onSaveNotes(notesAppointment.id, notesValue.trim());
      setNotesAppointment(null);
    } catch (error) {
      setNotesError(error instanceof Error ? error.message : "Não foi possível salvar a anotação.");
    } finally {
      setSavingNotes(false);
    }
  }

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
    <>
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
            {appointment.type === "ONLINE" && ["SCHEDULED", "OCURRING"].includes(appointment.status) && <Link className="btn-primary px-4 py-2" href={`/call/${appointment.id}`}>Entrar na videochamada</Link>}
            {onCancel && appointment.status === "SCHEDULED" && (
              <button className="btn-danger px-4 py-2" disabled={cancelingId === appointment.id} onClick={() => void handleCancel(appointment.id)} type="button">
                {cancelingId === appointment.id ? "Cancelando..." : "Cancelar consulta"}
              </button>
            )}
            {mode === "doctor" && onSaveNotes && ["OCURRING", "COMPLETED"].includes(appointment.status) && (
              <button className="btn-secondary px-4 py-2" onClick={() => openNotes(appointment)} type="button">
                {appointment.notes ? "Editar anotação" : "Adicionar anotação"}
              </button>
            )}
            {appointment.notes && (
              <button className="btn-secondary px-4 py-2" onClick={() => setViewingNotes(appointment)} type="button">
                Ver anotação
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
    {notesAppointment && (
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="notes-title">
        <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-slate-950" id="notes-title">Anotação da consulta</h2>
          <p className="mt-2 text-sm text-slate-600">O paciente e a clínica poderão visualizar este conteúdo.</p>
          <textarea
            autoFocus
            className="input mt-5 min-h-48"
            maxLength={5000}
            onChange={(event) => setNotesValue(event.target.value)}
            placeholder="Escreva orientações, observações ou recomendações para o paciente..."
            value={notesValue}
          />
          {notesError && <p className="mt-3 text-sm text-rose-700">{notesError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button className="btn-secondary" disabled={savingNotes} onClick={() => setNotesAppointment(null)} type="button">Cancelar</button>
            <button className="btn-primary" disabled={savingNotes || !notesValue.trim()} onClick={() => void saveNotes()} type="button">
              {savingNotes ? "Salvando..." : "Salvar anotação"}
            </button>
          </div>
        </div>
      </div>
    )}
    {viewingNotes && (
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="view-notes-title">
        <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Consulta</p>
              <h2 className="mt-2 text-xl font-bold text-slate-950" id="view-notes-title">Anotação médica</h2>
              <p className="mt-1 text-sm text-slate-600">
                Dr(a). {viewingNotes.doctor.name} · {formatDate(viewingNotes.day)}
              </p>
            </div>
            <button
              aria-label="Fechar anotação"
              className="grid size-9 place-items-center rounded-md text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              onClick={() => setViewingNotes(null)}
              type="button"
            >
              ×
            </button>
          </div>
          <div className="mt-5 max-h-[60vh] overflow-y-auto rounded-md border border-teal-100 bg-teal-50 p-4">
            <p className="whitespace-pre-wrap leading-7 text-slate-700">{viewingNotes.notes}</p>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="btn-primary" onClick={() => setViewingNotes(null)} type="button">Fechar</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
