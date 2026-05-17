import { Appointment } from "../../domain/Aggregates/Appointment";
import { Identifier } from "../../domain/value-objects/Identifier";
import { Time } from "../../domain/value-objects/Time";
import { AppointmentStatus } from "../generated/prisma/client";

type PrismaAppointment = {
  id: string;
  patientId: string;
  doctorId: string;
  startTime: number;
  endTime: number;
  day: Date;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
};

export class AppointmentMapper {
  static toDomain(raw: PrismaAppointment): Appointment {
    return new Appointment(
      {
        patientId: new Identifier(raw.patientId),
        doctorId: new Identifier(raw.doctorId),
        startTime: Time.createWithSeconds(raw.startTime),
        endTime: Time.createWithSeconds(raw.endTime),
        day: raw.day,
        status: raw.status as Appointment["props"]["status"],
        reason: raw.reason,
        notes: raw.notes,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(appointment: Appointment): {
    id: string;
    patientId: string;
    doctorId: string;
    startTime: number;
    endTime: number;
    day: Date;
    status: AppointmentStatus;
    reason: string | null;
    notes: string | null;
  } {
    return {
      id: appointment.id.value,
      patientId: appointment.props.patientId.value,
      doctorId: appointment.props.doctorId.value,
      startTime: appointment.props.startTime.value,
      endTime: appointment.props.endTime.value,
      day: appointment.props.day,
      status: appointment.props.status as AppointmentStatus,
      reason: appointment.props.reason ?? null,
      notes: appointment.props.notes ?? null,
    };
  }
}
