import { Patient } from "../../domain/Aggregates/Patient";
import { CPF } from "../../domain/value-objects/Cpf";
import { Identifier } from "../../domain/value-objects/Identifier";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber";

type PrismaPatient = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  cpf: string;
};

export class PatientMapper {
  static toDomain(raw: PrismaPatient): Patient {
    return new Patient(
      {
        userId: new Identifier(raw.userId),
        name: raw.name,
        phone: new PhoneNumber(raw.phone),
        cpf: new CPF(raw.cpf),
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(patient: Patient): PrismaPatient {
    return {
      id: patient.id.value,
      userId: patient.props.userId.value,
      name: patient.props.name,
      phone: patient.props.phone.value,
      cpf: patient.props.cpf.cpf,
    };
  }
}
