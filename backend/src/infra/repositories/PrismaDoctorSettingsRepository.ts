import { injectable } from "inversify";
import type { DoctorSettingsRepository } from "../../domain/repositories/DoctorSettingsRepository";
import { DoctorSchedulingSettings } from "../../domain/entities/DoctorSchedulingSettings";
import { Identifier } from "../../domain/value-objects/Identifier";
import { prisma } from "../../lib/prisma";

@injectable()
export class PrismaDoctorSettingsRepository implements DoctorSettingsRepository {
  async findByDoctorId(
    doctorId: string,
  ): Promise<DoctorSchedulingSettings | null> {
    const row = await prisma.doctorSettings.findUnique({
      where: { doctorId },
    });
    if (!row) {
      return null;
    }
    return new DoctorSchedulingSettings(
      {
        doctorId: new Identifier(row.doctorId),
        minAppointmentTime: row.minAppointmentTime,
        maxAppointmentTime: row.maxAppointmentTime,
        defaultDuration: row.defaultDuration,
        bufferBetween: row.bufferBetween,
        advanceBookingHours: row.advanceBookingHours,
        maxDailyAppointments: row.maxDailyAppointments,
      },
      new Identifier(row.id),
    );
  }
}
