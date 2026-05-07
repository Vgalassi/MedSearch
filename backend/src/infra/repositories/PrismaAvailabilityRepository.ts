import { injectable } from "inversify";
import { Availability } from "../../domain/entities/Availability";
import { prisma } from "../../lib/prisma";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import { Identifier } from "../../domain/value-objects/Identifier";
@injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  async findByDoctorId(doctorId: string): Promise<Availability | null>  {
    const row = await prisma.availability.findFirst({
      where: { doctorId },
    });
    if(!row){
      return null
    }
    return new Availability({
      doctorId: new Identifier(row.doctorId),
      isAvailable: row.isAvaliable,
      weekDay: row.weekday,
      startTime: row.startTime,
      endTime: row.endTime

    },row.id)
    }
}
