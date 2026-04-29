import { injectable } from "inversify";
import { Clinic } from "../../domain/Aggregates/Clinic";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import { prisma } from "../../lib/prisma";
import { ClinicMapper } from "../mappers/ClinicMapper";

@injectable()
export class PrismaClinicRepository implements ClinicRepository {
  async save(clinic: Clinic): Promise<Clinic> {
    const data = ClinicMapper.toPersistence(clinic);

    const createdClinic = await prisma.clinic.create({
      data,
    });

    return ClinicMapper.toDomain(createdClinic as never);
  }
}
