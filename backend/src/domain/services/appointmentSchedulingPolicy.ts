import { AdvanceBookingViolationError } from "../errors/AdvanceBookingViolationError";
import { AppointmentInPastError } from "../errors/AppointmentInPastError";
import { AppointmentOutsideAvailabilityError } from "../errors/AppointmentOutsideAvailabilityError";
import { InvalidAppointmentDurationError } from "../errors/InvalidAppointmentDurationError";
import type { Availability } from "../entities/Availability";

export type AvailabilityWindow = {
  startTime: string;
  endTime: string;
};

const WEEKDAY_TO_UTC_DAY: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function durationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

export function assertNotInPast(start: Date, now: Date): void {
  if (start.getTime() < now.getTime()) {
    throw new AppointmentInPastError();
  }
}

export function assertAdvanceBooking(
  start: Date,
  now: Date,
  advanceBookingHours: number,
): void {
  const minStart = new Date(now.getTime() + advanceBookingHours * 3_600_000);
  if (start.getTime() < minStart.getTime()) {
    throw new AdvanceBookingViolationError(advanceBookingHours);
  }
}

export function assertDurationInRange(
  durationMinutesValue: number,
  minMinutes: number,
  maxMinutes: number,
): void {
  if (
    durationMinutesValue < minMinutes ||
    durationMinutesValue > maxMinutes
  ) {
    throw new InvalidAppointmentDurationError(
      minMinutes,
      maxMinutes,
      durationMinutesValue,
    );
  }
}

/** Parse "HH:mm" into a Date on the same UTC calendar day as `anchor`. */
export function utcTimeOnDate(anchor: Date, hhmm: string): Date {
  const parts = hhmm.trim().split(":");
  const hh = Number(parts[0]);
  const mm = Number(parts[1] ?? "0");
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    throw new Error(`Invalid time format: ${hhmm}`);
  }
  return new Date(
    Date.UTC(
      anchor.getUTCFullYear(),
      anchor.getUTCMonth(),
      anchor.getUTCDate(),
      hh,
      mm,
      0,
      0,
    ),
  );
}

export function availabilityWindowsForWeekday(
  availability: Availability[],
  weekday: number,
): AvailabilityWindow[] {
  return availability.flatMap((item) =>
    item.props.weekDayRange.range
      .filter((day) => WEEKDAY_TO_UTC_DAY[day.value] === weekday)
      .map(() => ({
        startTime: item.props.startTime.toString(),
        endTime: item.props.endTime.toString(),
      })),
  );
}

export function assertWithinAvailability(
  start: Date,
  end: Date,
  availability: Availability[],
): void {
  const weekday = start.getUTCDay();
  const dayWindows = availabilityWindowsForWeekday(availability, weekday);
  if (dayWindows.length === 0) {
    throw new AppointmentOutsideAvailabilityError();
  }

  for (const w of dayWindows) {
    const windowStart = utcTimeOnDate(start, w.startTime);
    const windowEnd = utcTimeOnDate(start, w.endTime);
    if (
      start.getTime() >= windowStart.getTime() &&
      end.getTime() <= windowEnd.getTime()
    ) {
      return;
    }
  }

  throw new AppointmentOutsideAvailabilityError();
}

/**
 * True if [ns, ne] overlaps [otherStart, otherEnd] or violates buffer between them.
 */
export function conflictsWithBuffer(
  ns: Date,
  ne: Date,
  otherStart: Date,
  otherEnd: Date,
  bufferMinutes: number,
): boolean {
  const b = bufferMinutes * 60_000;
  if (ns.getTime() < otherEnd.getTime() && ne.getTime() > otherStart.getTime()) {
    return true;
  }
  if (
    ns.getTime() >= otherEnd.getTime() &&
    ns.getTime() - otherEnd.getTime() < b
  ) {
    return true;
  }
  if (
    ne.getTime() <= otherStart.getTime() &&
    otherStart.getTime() - ne.getTime() < b
  ) {
    return true;
  }
  return false;
}

export function utcDayBounds(d: Date): { dayStart: Date; dayEnd: Date } {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  const dayStart = new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(y, m, day + 1, 0, 0, 0, 0));
  return { dayStart, dayEnd };
}

export function slotGridStepMinutes(minAppointmentMinutes: number): number {
  const step = Math.min(15, minAppointmentMinutes);
  return Math.max(5, step);
}
