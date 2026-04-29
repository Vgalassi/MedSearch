import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";

export type ClinicProps = {
  userId: Identifier
  name: string,
  address: string,
  cep: string,
  latitude: number,
  longitude: number,
  description: string,
  phone: string,
}


export class Clinic extends AgregateRoot<ClinicProps >{
    constructor(props: ClinicProps, id: Identifier){
      super(props,id)
    }
}