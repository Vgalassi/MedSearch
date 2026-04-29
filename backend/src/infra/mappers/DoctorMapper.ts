import { Doctor } from "../../domain/Aggregates/Doctor";
import { Identifier } from "../../domain/value-objects/Identifier";

type PrismaDoctor = {
  id: string;
  userId: string;
  name: string;
  phone: string;
  crm: string;
  speciality: string;
  clinicId: string | null;
};

export class DoctorMapper {
  static toDomain(raw: PrismaDoctor): Doctor {
    return new Doctor(
      {
        userId: new Identifier(raw.userId),
        name: raw.name,
        phone: raw.phone,
        crm: raw.crm,
        speciality: raw.speciality,
        clinicId: raw.clinicId ? new Identifier() : new Identifier()
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(doctor: Doctor): PrismaDoctor {
    return {
      id: doctor.id.value,
      userId: doctor.props.userId.value,
      name: doctor.props.name,
      phone: doctor.props.phone,
      crm: doctor.props.crm,
      speciality: doctor.props.speciality,
      clinicId: doctor.props.clinicId?.value ?? null,
    };
  }
}
