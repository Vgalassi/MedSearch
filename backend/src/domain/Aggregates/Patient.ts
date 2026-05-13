import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { CPF } from "../value-objects/Cpf";
import type { Identifier } from "../value-objects/Identifier";
import type { PhoneNumber } from "../value-objects/PhoneNumber";

export type PatientProps = {
  userId: Identifier;
  name: string;
  phone: PhoneNumber;
  cpf: CPF;
};

export class Patient extends AgregateRoot<PatientProps> {
  constructor(props: PatientProps, id: Identifier) {
    super(props, id);
  }
}