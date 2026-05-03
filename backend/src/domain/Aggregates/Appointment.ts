import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";
import { CannotCancelAppointmentError } from "../errors/CannotCancelAppointmentError";

export type AppointmentStatusValue =
  | "SCHEDULED"
  | "CANCELED"
  | "COMPLETED"
  | "NO_SHOW";

export type AppointmentProps = {
  patientId: Identifier;
  doctorId: Identifier;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatusValue;
  reason?: string | null;
  notes?: string | null;
};

export class Appointment extends AgregateRoot<AppointmentProps> {
  static createScheduled(input: {
    patientId: Identifier;
    doctorId: Identifier;
    startTime: Date;
    endTime: Date;
    reason?: string | null;
    notes?: string | null;
    id?: Identifier;
  }): Appointment {
    return new Appointment(
      {
        patientId: input.patientId,
        doctorId: input.doctorId,
        startTime: input.startTime,
        endTime: input.endTime,
        status: "SCHEDULED",
        reason: input.reason ?? null,
        notes: input.notes ?? null,
      },
      input.id,
    );
  }

  cancel(): void {
    if (this.props.status !== "SCHEDULED") {
      throw new CannotCancelAppointmentError(this.props.status);
    }
    this.props.status = "CANCELED";
  }
}
