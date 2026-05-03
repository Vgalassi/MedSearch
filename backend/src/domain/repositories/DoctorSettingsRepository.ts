import type { DoctorSchedulingSettings } from "../entities/DoctorSchedulingSettings";

export interface DoctorSettingsRepository {
  findByDoctorId(
    doctorId: string,
  ): Promise<DoctorSchedulingSettings | null>;
}
