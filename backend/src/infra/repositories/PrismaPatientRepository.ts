import { injectable } from "inversify";
import { Patient } from "../../domain/Aggregates/Patient";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";
import { prisma } from "../../lib/prisma";
import { PatientMapper } from "../mappers/PatientMapper";

@injectable()
export class PrismaPatientRepository implements PatientRepository {
  async save(patient: Patient): Promise<Patient> {
    const data = PatientMapper.toPersistence(patient);

    const createdPatient = await prisma.patient.create({
      data,
    });

    return PatientMapper.toDomain(createdPatient as never);
  }

  async findById(id: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
      where: { id },
    });
    if (!patient) {
      return null;
    }
    return PatientMapper.toDomain(patient as never);
  }
}
