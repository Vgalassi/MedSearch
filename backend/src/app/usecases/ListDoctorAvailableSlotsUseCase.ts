import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import { DoctorSettingsNotFoundError } from "../../domain/errors/DoctorSettingsNotFoundError";
import { InvalidAppointmentDurationError } from "../../domain/errors/InvalidAppointmentDurationError";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import type { DoctorSettingsRepository } from "../../domain/repositories/DoctorSettingsRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import {
  assertAdvanceBooking,
  assertNotInPast,
  availabilityWindowsForWeekday,
  conflictsWithBuffer,
  slotGridStepMinutes,
  utcDayBounds,
  utcTimeOnDate,
} from "../../domain/services/appointmentSchedulingPolicy";

export type AvailableSlotDto = {
  startTime: string;
  endTime: string;
};

export type ListDoctorAvailableSlotsInput = {
  doctorId: string;
  /** YYYY-MM-DD interpreted in UTC */
  date: string;
  durationMinutes?: number;
};

@injectable()
export class ListDoctorAvailableSlotsUseCase {
  constructor(
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
    @inject(TYPES.DoctorSettingsRepository)
    private readonly doctorSettingsRepository: DoctorSettingsRepository,
    @inject(TYPES.AvailabilityRepository)
    private readonly availabilityRepository: AvailabilityRepository,
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    input: ListDoctorAvailableSlotsInput,
  ): Promise<AvailableSlotDto[]> {
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

    const parts = input.date.split("-").map(Number);
    const y = parts[0]!;
    const m = parts[1]!;
    const d = parts[2]!;
    const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0));
    const weekday = anchor.getUTCDay();
    const windows = availabilityWindowsForWeekday(availability, weekday);
    if (windows.length === 0) {
      return [];
    }

    const { dayStart, dayEnd } = utcDayBounds(anchor);
    const existing = await this.appointmentRepository.findScheduledByDoctorBetween(
      input.doctorId,
      dayStart,
      dayEnd,
    );

    if (
      schedulingSettings.maxDailyAppointments != null &&
      existing.length >= schedulingSettings.maxDailyAppointments
    ) {
      return [];
    }

    const duration =
      input.durationMinutes ?? schedulingSettings.defaultDuration;
    if (
      duration < schedulingSettings.minAppointmentTime ||
      duration > schedulingSettings.maxAppointmentTime
    ) {
      throw new InvalidAppointmentDurationError(
        schedulingSettings.minAppointmentTime,
        schedulingSettings.maxAppointmentTime,
        duration,
      );
    }

    const durationMs = duration * 60_000;
    const stepMs =
      slotGridStepMinutes(schedulingSettings.minAppointmentTime) * 60_000;
    const now = new Date();
    const slots: AvailableSlotDto[] = [];

    for (const w of windows) {
      let cursor = utcTimeOnDate(anchor, w.startTime);
      const windowEnd = utcTimeOnDate(anchor, w.endTime);

      while (cursor.getTime() + durationMs <= windowEnd.getTime()) {
        const slotEnd = new Date(cursor.getTime() + durationMs);
        try {
          assertNotInPast(cursor, now);
          assertAdvanceBooking(
            cursor,
            now,
            schedulingSettings.advanceBookingHours,
          );
        } catch {
          cursor = new Date(cursor.getTime() + stepMs);
          continue;
        }

        let blocked = false;
        for (const ap of existing) {
          if (
            conflictsWithBuffer(
              cursor,
              slotEnd,
              ap.props.startTime,
              ap.props.endTime,
              schedulingSettings.bufferBetween,
            )
          ) {
            blocked = true;
            break;
          }
        }

        if (!blocked) {
          slots.push({
            startTime: cursor.toISOString(),
            endTime: slotEnd.toISOString(),
          });
        }

        cursor = new Date(cursor.getTime() + stepMs);
      }
    }

    return slots;
  }
}
