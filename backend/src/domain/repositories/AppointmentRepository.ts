import type { Appointment } from "../Aggregates/Appointment";

export type AppointmentConcurrencyParams = {
  bufferBetweenMinutes: number;
  maxDailyAppointments: number | null;
  dayStartUtc: Date;
  dayEndUtc: Date;
};

export interface AppointmentRepository {
  createWithConcurrencyGuard(
    appointment: Appointment,
    params: AppointmentConcurrencyParams,
  ): Promise<Appointment>;

  update(appointment: Appointment): Promise<Appointment>;

  findById(id: string): Promise<Appointment | null>;

  findByPatientId(patientId: string): Promise<Appointment[]>;

  findByDoctorId(doctorId: string): Promise<Appointment[]>;

  findScheduledByDoctor(
    doctorId: string,
  ): Promise<Appointment[]>;

  countScheduledByDoctorBetween(
    doctorId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<number>;
}
