import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";

export type PatientProps = {
  userId: Identifier;
  name: string;
  phone: string;
  cpf: string;
};

export class Patient extends AgregateRoot<PatientProps> {
  constructor(props: PatientProps, id: Identifier) {
    super(props, id);
  }
}