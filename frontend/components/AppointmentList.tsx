import { AppointmentDetails } from "./types/Appointment";

type AppointmentListProps = {
  appointments: AppointmentDetails[];
  emptyText: string;
  mode: "patient" | "doctor";
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    SCHEDULED: "Agendada",
    CANCELED: "Cancelada",
    COMPLETED: "Concluída",
    NO_SHOW: "Não compareceu",
  };

  return labels[status] ?? status;
}

export function AppointmentList({
  appointments,
  emptyText,
  mode,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <div className="surface p-8 text-center text-slate-600">{emptyText}</div>
    );
  }
  console.log(appointments)
  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <article
          className="surface grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr_auto] lg:items-center"
          key={appointment.id}
        >
          <div>
            <p className="text-sm font-semibold text-teal-700">
              {formatDate(appointment.day)} as {appointment.startTime}
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {mode === "patient"
                ? appointment.doctor.name
                : appointment.patient.name}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "patient"
                ? `${appointment.doctor.speciality} | CRM ${appointment.doctor.crm}`
                : appointment.patient.phone}
            </p>
          </div>

          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">
              {appointment.clinic?.name ?? "Clínica não vinculada"}
            </p>
            <p className="mt-1">
              {appointment.clinic?.address ?? "Atendimento particular"}
            </p>
            <p className="mt-1">
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>

          <span className="inline-flex justify-center rounded-md bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            {statusLabel(appointment.status)}
          </span>
        </article>
      ))}
    </div>
  );
}
