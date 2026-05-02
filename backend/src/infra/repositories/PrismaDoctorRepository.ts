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

  async findById(id: string): Promise<Doctor | null> {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return null;
    }

    return DoctorMapper.toDomain(doctor as never);
  }

  async findByClinicId(clinicId: string): Promise<Doctor[]> {
    const doctors = await prisma.doctor.findMany({
      where: { clinicId },
    });

    return doctors.map((doctor) => DoctorMapper.toDomain(doctor as never));
  }

  async update(doctor: Doctor): Promise<Doctor> {
    const data = DoctorMapper.toPersistence(doctor);

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id.value },
      data: {
        clinicId: data.clinicId,
      },
    });

    return DoctorMapper.toDomain(updatedDoctor as never);
  }
}
