import { injectable } from "inversify";
import { Availability } from "../../domain/entities/Availability";
import { prisma } from "../../lib/prisma";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import { Identifier } from "../../domain/value-objects/Identifier";
import { Time } from "../../domain/value-objects/Time";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { WeekDayRange } from "../../domain/value-objects/WeekDayRange";

const WEEKDAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

function toWeekDay(weekday: number): WeekDay {
  const day = WEEKDAYS[weekday];
  if (!day) {
    throw new Error(`Invalid weekday: ${weekday}`);
  }
  return new WeekDay(day);
}

function toTime(value: string | number): Time {
  if (typeof value === "number") {
    return new Time(Math.floor(value / 60), value % 60);
  }

  const [hour, minute = "0"] = value.includes(":")
    ? value.split(":")
    : [String(Math.floor(Number(value) / 60)), String(Number(value) % 60)];

  return new Time(Number(hour), Number(minute));
}

@injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  async findByDoctorId(doctorId: string): Promise<Availability[]>  {
    const rows = await prisma.availability.findMany({
      where: { doctorId },
    });

    return rows.map((row) => new Availability(
      {
        doctorId: new Identifier(row.doctorId),
        isAvailable: true,
        weekDayRange: new WeekDayRange([toWeekDay(row.weekday)]),
        startTime: toTime(row.startTime),
        endTime: toTime(row.endTime),
      },
      new Identifier(row.id),
    ));
  }
}
