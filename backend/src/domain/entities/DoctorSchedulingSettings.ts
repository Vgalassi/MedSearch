import { Entity } from "../value-objects/Entity";
import type { Identifier } from "../value-objects/Identifier";
import { Time } from "../value-objects/Time";
export type DoctorSchedulingSettingsProps = {
  doctorId: Identifier;
  isAvaliable: boolean;
  defaultDuration: Time;
  bufferBetween: Time;
  advanceBookingHours: number;
  maxSchedulingDays: number;
  maxDailyAppointments: number | null;

};

export class DoctorSchedulingSettings extends Entity<DoctorSchedulingSettingsProps> {
  static createDefault(doctorId: Identifier): DoctorSchedulingSettings {
    return new DoctorSchedulingSettings({
      doctorId,
      isAvaliable: true,
      defaultDuration: new Time(0,30),
      bufferBetween: new Time(0,10),
      advanceBookingHours: 24,
      maxSchedulingDays: 90,
      maxDailyAppointments: null,
    });
  }
}
