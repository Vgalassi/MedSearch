// infra/database/prisma/mappers/prisma-user-mapper.ts
import type { UserModel as PrismaUser } from "../generated/prisma/models/User"; // O tipo do Prisma
import { User } from "../../domain/entities/User"; // Sua classe de domínio

export class PrismaUserMapper {
  // Converte do Domínio para o Prisma (usado no Create/Update)
  static toPrisma(user: User) {
    return {
      id: user.props.id,
      name: user.props.name,
      email: user.props.email,
      password: user.props.password,
      role: user.props.role,
    };
  }

  // Converte do Prisma para o Domínio (usado no findById/get)
  static toDomain(raw: PrismaUser): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role as any, // Aqui você mapeia o enum do banco para o do domínio
    });
  }
}