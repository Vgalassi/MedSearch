import { Clinic } from "../../domain/Aggregates/Clinic";
import { Address } from "../../domain/value-objects/Address";
import { Cep } from "../../domain/value-objects/Cep";
import { Identifier } from "../../domain/value-objects/Identifier";
import { PhoneNumber } from "../../domain/value-objects/PhoneNumber";

type PrismaClinic = {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  number: string;
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
        address: new Address(
          raw.street,
          raw.city,
          raw.state,
          new Cep(raw.cep),
          raw.number,
          raw.latitude,
          raw.longitude,
        ),
        description: raw.description,
        phone: new PhoneNumber(raw.phone),
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(clinic: Clinic): PrismaClinic {
    return {
      id: clinic.id.value,
      userId: clinic.props.userId.value,
      name: clinic.props.name,
      street: clinic.props.address.street,
      city: clinic.props.address.city,
      state: clinic.props.address.state,
      number: clinic.props.address.number ?? "",
      cep: clinic.props.address.cep.value,
      latitude: clinic.props.address.latitude ?? 0,
      longitude: clinic.props.address.longitude ?? 0,
      description: clinic.props.description,
      phone: clinic.props.phone.value,
    };
  }
}
