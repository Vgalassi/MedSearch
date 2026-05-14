import { AgregateRoot } from "../value-objects/AgregateRoot";
import { DoctorSchedulingSettings } from "../entities/DoctorSchedulingSettings";
import type { Identifier } from "../value-objects/Identifier";
import type { PhoneNumber } from "../value-objects/PhoneNumber";
import { Availability } from "../entities/Availability";

export type DoctorProps = {
  userId: Identifier;
  name: string;
  phone: PhoneNumber;
  crm: string;
  speciality: string;
  clinicId?: Identifier | null;
  schedulingSettings: DoctorSchedulingSettings | null;
  Availabilities: Availability[] | null
};

export class Doctor extends AgregateRoot<DoctorProps> {
  static create(props: DoctorProps ,id?: Identifier): Doctor {
    const doctor = new Doctor(
      {
        ...props,
      },
      id,
    );

    if (!doctor.props.schedulingSettings) {
      doctor.props.schedulingSettings =
        DoctorSchedulingSettings.createDefault(doctor.id);
    }

    if(!doctor.props.Availabilities){
      doctor.props.Availabilities = [Availability.createDefault(doctor.id)]
    }

    return doctor;
  }


  constructor(props: DoctorProps, id?: Identifier) {
    super(props, id);
  }
}
