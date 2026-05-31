import { DoctorAlreadyOnClinic } from "../errors/DoctorAlreadyOnClinic";
import { DoctorNotOnClinic } from "../errors/DoctorNotOnClinic";
import type { Address } from "../value-objects/Address";
import { AgregateRoot } from "../value-objects/AgregateRoot";
import type { Identifier } from "../value-objects/Identifier";
import type { PhoneNumber } from "../value-objects/PhoneNumber";
import { Doctor } from "./Doctor";
export type ClinicProps = {
  userId: Identifier
  name: string,
  address: Address,
  description: string,
  phone: PhoneNumber,
}


export class Clinic extends AgregateRoot<ClinicProps >{
    constructor(props: ClinicProps, id: Identifier){
      super(props,id)
    }


    addDoctor(doctor: Doctor):Doctor{
      if(doctor.props.clinicId != null){
        throw new DoctorAlreadyOnClinic(doctor.props.name)
      }
      doctor.props.clinicId = this.id
      return doctor
    }

    removeDoctor(doctor: Doctor): Doctor{
      if(doctor.props.clinicId?.value != this.id.value){
        throw new DoctorNotOnClinic(doctor.props.name)
      }
      doctor.props.clinicId = null
      return doctor
    }
}
