import { User } from "../../domain/Aggregates/User";
import { Email } from "../../domain/value-objects/Email";
import { Identifier } from "../../domain/value-objects/Identifier";

type PrismaUser = {
  id: string;
  email: string;
  password: string;
  role: "DOCTOR" | "PATIENT" | "CLINIC";
};

export class UserMapper {
  static toDomain(raw: PrismaUser): User {
    return new User(
      {
        email: new Email(raw.email),
        password: raw.password,
        role: raw.role,
      },
      new Identifier(raw.id),
    );
  }

  static toPersistence(user: User): PrismaUser {
    return {
      id: user.id.value,
      email: user.props.email.email,
      password: user.props.password,
      role: user.props.role,
    };
  }
}
