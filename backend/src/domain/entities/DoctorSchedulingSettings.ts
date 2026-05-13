import { Entity } from "../value-objects/Entity";
import type { Identifier } from "../value-objects/Identifier";
import { Time } from "../value-objects/Time";
export type DoctorSchedulingSettingsProps = {
  doctorId: Identifier;
  isAvaliable: boolean;
  minAppointmentTime: Time;
  maxAppointmentTime: Time;
  defaultDuration: Time;
  bufferBetween: Time;
  advanceBookingHours: number;
  maxDailyAppointments: number | null;
};

export class DoctorSchedulingSettings extends Entity<DoctorSchedulingSettingsProps> {
  static createDefault(doctorId: Identifier): DoctorSchedulingSettings {
    return new DoctorSchedulingSettings({
      doctorId,
      isAvaliable: true,
      minAppointmentTime: new Time(0,30),
      maxAppointmentTime: new Time(1,0),
      defaultDuration: new Time(0,30),
      bufferBetween: new Time(0,10),
      advanceBookingHours: 24,
      maxDailyAppointments: null,
    });
  }
}
