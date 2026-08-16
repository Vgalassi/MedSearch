import { Entity } from "../value-objects/Entity";
import type { Identifier } from "../value-objects/Identifier";
import { Time } from "../value-objects/Time";
import { Period } from "../value-objects/Period";
export type DoctorSchedulingSettingsProps = {
  doctorId: Identifier;
  isAvaliable: boolean;
  defaultDuration: Time;
  bufferBetween: Time;
  minimumBookingNotice: Period;
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
      minimumBookingNotice: new Period(0, 0),
      maxSchedulingDays: 90,
      maxDailyAppointments: null,
    });
  }
}
