import { Patient } from "../../domain/Aggregates/Patient";
import { Identifier } from "../../domain/value-objects/Identifier";

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
        phone: raw.phone,
        cpf: raw.cpf,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(patient: Patient): PrismaPatient {
    return {
      id: patient.id.value,
      userId: patient.props.userId.value,
      name: patient.props.name,
      phone: patient.props.phone,
      cpf: patient.props.cpf,
    };
  }
}
