import { injectable } from "inversify";
import { Doctor } from "../../domain/Aggregates/Doctor";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { prisma } from "../../lib/prisma";
import { DoctorMapper } from "../mappers/DoctorMapper";

@injectable()
export class PrismaDoctorRepository implements DoctorRepository {
  async save(doctor: Doctor): Promise<Doctor> {
    const data = DoctorMapper.toPersistence(doctor);

    const createdDoctor = await prisma.doctor.create({
      data,
    });

    return DoctorMapper.toDomain(createdDoctor as never);
  }
}
