import { DoctorRow } from "./DoctorRow";
import { Doctor } from "./types/Doctor";
import { EmptyState } from "./ui/EmptyState";
import type { ReactNode } from "react";

type ClinicDoctorSectionProps = {
  kicker: string;
  title: string;
  doctors: Doctor[];
  emptyText: string;
  isFetching: boolean;
  actionLabel: string;
  actionStyle?: "primary" | "danger";
  onAction: (doctorId: string) => void;
  pendingDoctorIds?: Set<string>;
  secondaryActionLabel?: string;
  onSecondaryAction?: (doctorId: string) => void;
  toolbar?: ReactNode;
  footer?: ReactNode;
};

export function ClinicDoctorSection({
  kicker,
  title,
  doctors,
  emptyText,
  isFetching,
  actionLabel,
  actionStyle,
  onAction,
  pendingDoctorIds,
  secondaryActionLabel,
  onSecondaryAction,
  toolbar,
  footer,
}: ClinicDoctorSectionProps) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
        </div>
      </div>

      {toolbar}

      <div className="mt-5 space-y-4">
        {doctors.map((doctor) => (
          <DoctorRow
            actionLabel={pendingDoctorIds?.has(doctor.id) ? "Solicitacao enviada" : actionLabel}
            actionStyle={actionStyle}
            doctor={doctor}
            key={doctor.id}
            disabled={pendingDoctorIds?.has(doctor.id)}
            onAction={() => onAction(doctor.id)}
            secondaryActionLabel={secondaryActionLabel}
            {...(onSecondaryAction ? { onSecondaryAction: () => onSecondaryAction(doctor.id) } : {})}
          />
        ))}

        {!isFetching && doctors.length === 0 && <EmptyState text={emptyText} />}
      </div>
      {footer}
    </div>
  );
}
