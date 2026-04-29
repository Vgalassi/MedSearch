import { Clinic } from "../../domain/Aggregates/Clinic";
import { Identifier } from "../../domain/value-objects/Identifier";

type PrismaClinic = {
  id: string;
  userId: string;
  name: string;
  address: string;
  cep: string;
  latitude: number;
  longitude: number;
  description: string;
  phone: string;
};

export class ClinicMapper {
  static toDomain(raw: PrismaClinic): Clinic {
    return new Clinic(
      {
        userId: new Identifier(raw.userId),
        name: raw.name,
        address: raw.address,
        cep: raw.cep,
        latitude: raw.latitude,
        longitude: raw.longitude,
        description: raw.description,
        phone: raw.phone,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(clinic: Clinic): PrismaClinic {
    return {
      id: clinic.id.value,
      userId: clinic.props.userId.value,
      name: clinic.props.name,
      address: clinic.props.address,
      cep: clinic.props.cep,
      latitude: clinic.props.latitude,
      longitude: clinic.props.longitude,
      description: clinic.props.description,
      phone: clinic.props.phone,
    };
  }
}
