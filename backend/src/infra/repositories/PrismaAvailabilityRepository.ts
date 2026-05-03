import { injectable } from "inversify";
import type {
  AvailabilityRecord,
  AvailabilityRepository,
} from "../../domain/repositories/AvailabilityRepository";
import { prisma } from "../../lib/prisma";

@injectable()
export class PrismaAvailabilityRepository implements AvailabilityRepository {
  async findByDoctorId(doctorId: string): Promise<AvailabilityRecord[]> {
    const rows = await prisma.availability.findMany({
      where: { doctorId },
    });
    return rows.map((row) => ({
      id: row.id,
      doctorId: row.doctorId,
      weekday: row.weekday,
      startTime: row.startTime,
      endTime: row.endTime,
    }));
  }
}
