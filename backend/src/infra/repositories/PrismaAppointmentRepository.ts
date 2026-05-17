import { injectable } from "inversify";
import { Appointment } from "../../domain/Aggregates/Appointment";
import type {
  AppointmentConcurrencyParams,
  AppointmentRepository,
} from "../../domain/repositories/AppointmentRepository";
import { conflictsWithBuffer } from "../../domain/services/appointmentSchedulingPolicy";
import { prisma } from "../../lib/prisma";
import { AppointmentMapper } from "../mappers/AppointmentMapper";
import { AppointmentStatus, Prisma } from "../generated/prisma/client";
import { AppointmentSchedulingConflictError } from "../../domain/errors/AppointmentSchedulingConflictError";
import { DailyAppointmentLimitReachedError } from "../../domain/errors/DailyAppointmentLimitReachedError";

@injectable()
export class PrismaAppointmentRepository implements AppointmentRepository {
  async createWithConcurrencyGuard(
    appointment: Appointment,
    params: AppointmentConcurrencyParams,
  ): Promise<Appointment> {
    const data = AppointmentMapper.toPersistence(appointment);
    const bufferMs = params.bufferBetweenMinutes * 60_000;

    const rangeStart = new Date(data.startTime.getTime() - bufferMs);
    const rangeEnd = new Date(data.endTime.getTime() + bufferMs);

    return prisma.$transaction(
      async (tx) => {
        if (params.maxDailyAppointments != null) {
          const count = await tx.appointment.count({
            where: {
              doctorId: data.doctorId,
              status: AppointmentStatus.SCHEDULED,
              startTime: {
                gte: params.dayStartUtc,
                lt: params.dayEndUtc,
              },
            },
          });
          if (count >= params.maxDailyAppointments) {
            throw new DailyAppointmentLimitReachedError(
              params.maxDailyAppointments,
            );
          }
        }

        const candidates = await tx.appointment.findMany({
          where: {
            doctorId: data.doctorId,
            status: AppointmentStatus.SCHEDULED,
            startTime: { lt: rangeEnd },
            endTime: { gt: rangeStart },
          },
        });

        for (const row of candidates) {
          if (
            conflictsWithBuffer(
              data.startTime,
              data.endTime,
              row.startTime,
              row.endTime,
              params.bufferBetweenMinutes,
            )
          ) {
            throw new AppointmentSchedulingConflictError();
          }
        }

        const created = await tx.appointment.create({
          data,
        });

        return AppointmentMapper.toDomain(created as never);
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5_000,
        timeout: 10_000,
      },
    );
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
        startTime: { gte: rangeStart, lt: rangeEnd },
      },
    });
  }
}
