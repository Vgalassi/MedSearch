import type { Availability } from "../entities/Availability";


export interface AvailabilityRepository {
  findByDoctorId(doctorId: string): Promise<Availability[]>;
}
