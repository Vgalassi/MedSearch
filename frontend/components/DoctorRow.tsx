import { Doctor } from "./types/Doctor";

type DoctorRowProps = {
  doctor: Doctor;
  actionLabel: string;
  actionStyle?: "primary" | "danger";
  onAction: () => void;
};

export function DoctorRow({
  doctor,
  actionLabel,
  actionStyle = "primary",
  onAction,
}: DoctorRowProps) {
  return (
    <article className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-teal-700">{doctor.speciality}</p>
        <h3 className="mt-1 text-lg font-bold text-slate-950">{doctor.name}</h3>
        <p className="mt-2 text-sm text-slate-600">
          CRM {doctor.crm} | {doctor.phone}
        </p>
      </div>
      <button
        className={actionStyle === "danger" ? "btn-danger" : "btn-primary"}
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </article>
  );
}
