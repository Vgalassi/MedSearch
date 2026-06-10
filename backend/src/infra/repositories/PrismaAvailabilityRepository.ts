import { injectable } from "inversify";
import { Availability } from "../../domain/entities/Availability";
import { prisma } from "../../lib/prisma";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import { Identifier } from "../../domain/value-objects/Identifier";
import { Time } from "../../domain/value-objects/Time";
import { WeekDay } from "../../domain/value-objects/WeekDay";
import { WeekDayRange } from "../../domain/value-objects/WeekDayRange";
import { AvailabilityMode } from "../../domain/value-objects/AvailabilityMode";

@injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  async findByDoctorId(doctorId: string): Promise<Availability[]>  {
    const rows = await prisma.availability.findMany({
      where: { doctorId },
    });

    return rows.map((row) => new Availability(
      {
        doctorId: new Identifier(row.doctorId),
        weekDayRange: new WeekDayRange(
          row.weekdays.map((weekday) => new WeekDay(weekday)),
        ),
        mode: new AvailabilityMode(row.mode),
        startTime: Time.createWithSeconds(row.startMinutes),
        endTime: Time.createWithSeconds(row.endMinutes),
      },
      new Identifier(row.id),
    ));
  }
}
