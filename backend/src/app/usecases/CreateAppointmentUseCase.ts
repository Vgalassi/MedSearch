import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import { Appointment } from "../../domain/Aggregates/Appointment";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import { DoctorSettingsNotFoundError } from "../../domain/errors/DoctorSettingsNotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import type { DoctorSettingsRepository } from "../../domain/repositories/DoctorSettingsRepository";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import {
  assertAdvanceBooking,
  assertDurationInRange,
  assertNotInPast,
  assertWithinAvailability,
  durationMinutes,
  utcDayBounds,
} from "../../domain/services/appointmentSchedulingPolicy";
import { Identifier } from "../../domain/value-objects/Identifier";
import { InvalidAppointmentTimeOrderError } from "../../domain/errors/InvalidAppointmentTimeOrderError";

export type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
  notes?: string | null;
};

@injectable()
export class CreateAppointmentUseCase {
  constructor(
    @inject(TYPES.PatientRepository)
    private readonly patientRepository: PatientRepository,
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
    @inject(TYPES.DoctorSettingsRepository)
    private readonly doctorSettingsRepository: DoctorSettingsRepository,
    @inject(TYPES.AvailabilityRepository)
    private readonly availabilityRepository: AvailabilityRepository,
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const patient = await this.patientRepository.findById(input.patientId);
    if (!patient) {
      throw new NotfoundError("Patient", input.patientId);
    }

    const doctor = await this.doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", input.doctorId);
    }

    const settings = await this.doctorSettingsRepository.findByDoctorId(
      input.doctorId,
    );
    if (!settings) {
      throw new DoctorSettingsNotFoundError(input.doctorId);
    }
    const schedulingSettings = settings.props;

    const availability = await this.availabilityRepository.findByDoctorId(
      input.doctorId,
    );

    const start = new Date(input.startTime);
    const end = new Date(input.endTime);
    const now = new Date();

    const duration = durationMinutes(start, end);
    if (duration <= 0) {
      throw new InvalidAppointmentTimeOrderError();
    }

    assertNotInPast(start, now);
    assertAdvanceBooking(start, now, schedulingSettings.advanceBookingHours);
    assertDurationInRange(
      duration,
      schedulingSettings.minAppointmentTime,
      schedulingSettings.maxAppointmentTime,
    );
    assertWithinAvailability(start, end, availability);

    const { dayStart, dayEnd } = utcDayBounds(start);

    const appointment = Appointment.createScheduled({
      patientId: new Identifier(input.patientId),
      doctorId: new Identifier(input.doctorId),
      startTime: start,
      endTime: end,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
    });

    return this.appointmentRepository.createWithConcurrencyGuard(appointment, {
      bufferBetweenMinutes: schedulingSettings.bufferBetween,
      maxDailyAppointments: schedulingSettings.maxDailyAppointments,
      dayStartUtc: dayStart,
      dayEndUtc: dayEnd,
    });
  }
}
