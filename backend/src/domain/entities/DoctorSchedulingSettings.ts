import { Entity } from "../value-objects/Entity";
import type { Identifier } from "../value-objects/Identifier";

export type DoctorSchedulingSettingsProps = {
  doctorId: Identifier;
  minAppointmentTime: number;
  maxAppointmentTime: number;
  defaultDuration: number;
  bufferBetween: number;
  advanceBookingHours: number;
  maxDailyAppointments: number | null;
};

export class DoctorSchedulingSettings extends Entity<DoctorSchedulingSettingsProps> {
  static createDefault(doctorId: Identifier): DoctorSchedulingSettings {
    return new DoctorSchedulingSettings({
      doctorId,
      minAppointmentTime: 15,
      maxAppointmentTime: 120,
      defaultDuration: 30,
      bufferBetween: 10,
      advanceBookingHours: 24,
      maxDailyAppointments: null,
    });
  }
}
