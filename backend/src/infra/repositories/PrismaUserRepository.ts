import { injectable } from "inversify";
import { User } from "../../domain/Aggregates/User";
import type { UserRepository } from "../../domain/repositories/UserRepository";
import type { Email } from "../../domain/value-objects/Email";
import { prisma } from "../../lib/prisma";
import { UserMapper } from "../mappers/UserMapper";

@injectable()
export class PrismaUserRepository implements UserRepository {
  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    const createdUser = await prisma.user.create({
      data,
    });

    return UserMapper.toDomain(createdUser as never);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const foundUser = await prisma.user.findUnique({
      where: { email: email.email },
    });

    if (!foundUser) {
      return null;
    }

    return UserMapper.toDomain(foundUser as never);
  }
}
