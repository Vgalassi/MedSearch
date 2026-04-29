import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";

export type DoctorProps = {
  userId: Identifier;
  name: string;
  phone: string;
  crm: string;
  speciality: string;
  clinicId?: Identifier;
};

export class Doctor extends AgregateRoot<DoctorProps> {
  constructor(props: DoctorProps, id: Identifier) {
    super(props, id);
  }
}