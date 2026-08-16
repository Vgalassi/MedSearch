import { injectable } from "inversify";
import type { DoctorSettingsRepository } from "../../domain/repositories/DoctorSettingsRepository";
import { DoctorSchedulingSettings } from "../../domain/entities/DoctorSchedulingSettings";
import { Identifier } from "../../domain/value-objects/Identifier";
import { prisma } from "../../lib/prisma";
import { Time } from "../../domain/value-objects/Time";
import { Period } from "../../domain/value-objects/Period";
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
        isAvaliable: row.isAvaliable,
        doctorId: new Identifier(row.doctorId),
        maxSchedulingDays: row.maxSchedullingDays,
        defaultDuration: Time.createWithSeconds(row.defaultDuration),
        bufferBetween: Time.createWithSeconds(row.bufferBetween),
        minimumBookingNotice: Period.createWithSeconds(row.minimumBookingNotice),
        maxDailyAppointments: row.maxDailyAppointments,
      },
      new Identifier(row.id),
    );
  }
}
