export type AvailabilityRecord = {
  id: string;
  doctorId: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

export interface AvailabilityRepository {
  findByDoctorId(doctorId: string): Promise<AvailabilityRecord[]>;
}
