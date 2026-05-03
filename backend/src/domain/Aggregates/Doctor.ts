import { AgregateRoot } from "../value-objects/AgregateRoot";
import { DoctorSchedulingSettings } from "../entities/DoctorSchedulingSettings";
import type { Identifier } from "../value-objects/Identifier";

export type DoctorProps = {
  userId: Identifier;
  name: string;
  phone: string;
  crm: string;
  speciality: string;
  clinicId?: Identifier | null;
  schedulingSettings?: DoctorSchedulingSettings | null;
};

export class Doctor extends AgregateRoot<DoctorProps> {
  static create(
    props: Omit<DoctorProps, "schedulingSettings"> & {
      schedulingSettings?: DoctorSchedulingSettings | null;
    },
    id?: Identifier,
  ): Doctor {
    const doctor = new Doctor(
      {
        ...props,
        schedulingSettings: props.schedulingSettings ?? null,
      },
      id,
    );

    if (!doctor.props.schedulingSettings) {
      doctor.props.schedulingSettings =
        DoctorSchedulingSettings.createDefault(doctor.id);
    }

    return doctor;
  }

  constructor(props: DoctorProps, id?: Identifier) {
    super(props, id);
  }
}
