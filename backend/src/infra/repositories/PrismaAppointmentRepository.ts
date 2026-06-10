import { injectable } from "inversify";
import { Appointment } from "../../domain/Aggregates/Appointment";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { prisma } from "../../lib/prisma";
import { AppointmentMapper } from "../mappers/AppointmentMapper";
import { AppointmentStatus } from "../generated/prisma/client";

@injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  async create(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    const created = await prisma.appointment.create({ data });

    return AppointmentMapper.toDomain(created as never);
  }

  async update(appointment: Appointment): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    const updated = await prisma.appointment.update({
      where: { id: data.id },
      data: {
        status: data.status,
        reason: data.reason,
        notes: data.notes,
        startTime: data.startTime,
        endTime: data.endTime,
        day: data.day,
        type: data.type,
      },
    });
    return AppointmentMapper.toDomain(updated as never);
  }

  async findById(id: string): Promise<Appointment | null> {
    const row = await prisma.appointment.findUnique({ where: { id } });
    if (!row) {
      return null;
    }
    return AppointmentMapper.toDomain(row as never);
  }

  async findByPatientId(patientId: string): Promise<Appointment[]> {
    const rows = await prisma.appointment.findMany({
      where: { patientId },
      orderBy: { startTime: "desc" },
    });
    return rows.map((r) => AppointmentMapper.toDomain(r as never));
  }

  async findByDoctorId(doctorId: string): Promise<Appointment[]> {
    const rows = await prisma.appointment.findMany({
      where: { doctorId },
      orderBy: { startTime: "desc" },
    });
    return rows.map((r) => AppointmentMapper.toDomain(r as never));
  }

  async findScheduledByDoctor(
    doctorId: string,
  ): Promise<Appointment[]> {
    const rows = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.SCHEDULED
      },
      orderBy: { startTime: "asc" },
    });
    return rows.map((r) => AppointmentMapper.toDomain(r as never));
  }

  async countScheduledByDoctorBetween(
    doctorId: string,
    rangeStart: Date,
    rangeEnd: Date,
  ): Promise<number> {
    return prisma.appointment.count({
      where: {
        doctorId,
        status: AppointmentStatus.SCHEDULED,
        day: { gte: rangeStart, lt: rangeEnd },
      },
    });
  }
}
