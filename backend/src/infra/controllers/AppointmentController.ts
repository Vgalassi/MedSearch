import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { CreateAppointmentUseCase } from "../../app/usecases/CreateAppointmentUseCase";
import { CancelAppointmentUseCase } from "../../app/usecases/CancelAppointmentUseCase";
import { ListPatientAppointmentsUseCase } from "../../app/usecases/ListPatientAppointmentsUseCase";
import { ListDoctorAppointmentsUseCase } from "../../app/usecases/ListDoctorAppointmentsUseCase";
import { ListDoctorAvailableSlotsUseCase } from "../../app/usecases/ListDoctorAvailableSlotsUseCase";
import {
  appointmentIdParamsSchema,
  availableSlotsQuerySchema,
  createAppointmentBodySchema,
  doctorIdParamsSchema,
  patientIdParamsSchema,
} from "../schemas/appointmentSchemas";
import { prisma } from "../../lib/prisma";

function toAppointmentDto(appointment: Appointment) {
  return {
    id: appointment.id.value,
    patientId: appointment.props.patientId.value,
    doctorId: appointment.props.doctorId.value,
    startTime: appointment.props.startTime.toString(),
    endTime: appointment.props.endTime.toString(),
    day: appointment.props.day.toISOString(),
    status: appointment.props.status,
    reason: appointment.props.reason ?? null,
    notes: appointment.props.notes ?? null,
  };
}

function formatTimeFromSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toDetailedAppointmentDto(row: Awaited<ReturnType<typeof findDetailedAppointments>>[number]) {
  return {
    id: row.id,
    patientId: row.patientId,
    doctorId: row.doctorId,
    startTime: formatTimeFromSeconds(row.startTime),
    endTime: formatTimeFromSeconds(row.endTime),
    day: row.day.toISOString(),
    status: row.status,
    reason: row.reason ?? null,
    notes: row.notes ?? null,
    doctor: {
      id: row.doctor.id,
      name: row.doctor.name,
      phone: row.doctor.phone,
      crm: row.doctor.crm,
      speciality: row.doctor.speciality,
    },
    clinic: row.doctor.clinic
      ? {
          id: row.doctor.clinic.id,
          name: row.doctor.clinic.name,
          phone: row.doctor.clinic.phone,
          address: row.doctor.clinic.address,
          cep: row.doctor.clinic.cep,
        }
      : null,
    patient: {
      id: row.patient.id,
      name: row.patient.name,
      phone: row.patient.phone,
    },
  };
}

function findDetailedAppointments(where: { patientId?: string; doctorId?: string }) {
  return prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: {
        include: {
          clinic: true,
        },
      },
    },
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
  });
}

@injectable()
export class AppointmentController {
  constructor(
    @inject(TYPES.CreateAppointmentUseCase)
    private readonly createAppointmentUseCase: CreateAppointmentUseCase,
    @inject(TYPES.CancelAppointmentUseCase)
    private readonly cancelAppointmentUseCase: CancelAppointmentUseCase,
    @inject(TYPES.ListPatientAppointmentsUseCase)
    private readonly listPatientAppointmentsUseCase: ListPatientAppointmentsUseCase,
    @inject(TYPES.ListDoctorAppointmentsUseCase)
    private readonly listDoctorAppointmentsUseCase: ListDoctorAppointmentsUseCase,
    @inject(TYPES.ListDoctorAvailableSlotsUseCase)
    private readonly listDoctorAvailableSlotsUseCase: ListDoctorAvailableSlotsUseCase,
  ) {}

  async create(req: FastifyRequest, res: FastifyReply) {
    const body = createAppointmentBodySchema.parse(req.body);
    const created = await this.createAppointmentUseCase.execute({
      patientId: body.patientId,
      doctorId: body.doctorId,
      startTime: body.startTime,
      endTime: body.endTime,
      day: new Date(body.day),
      reason: body.reason ?? null,
      notes: body.notes ?? null,
    });
    return res.status(201).send({ appointment: toAppointmentDto(created) });
  }


  async cancel(req: FastifyRequest, res: FastifyReply) {
    const params = appointmentIdParamsSchema.parse(req.params);
    const updated = await this.cancelAppointmentUseCase.execute(params.id);
    return res.status(200).send({ appointment: toAppointmentDto(updated) });
  }

  async listByPatient(req: FastifyRequest, res: FastifyReply) {
    const params = patientIdParamsSchema.parse(req.params);
    const list = await this.listPatientAppointmentsUseCase.execute(
      params.patientId,
    );
    return res.status(200).send({
      appointments: list.map(toAppointmentDto),
    });
  }

  async listByDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamsSchema.parse(req.params);
    const list = await this.listDoctorAppointmentsUseCase.execute(
      params.doctorId,
    );
    return res.status(200).send({
      appointments: list.map(toAppointmentDto),
    });
  }

  async listDetailedByPatient(req: FastifyRequest, res: FastifyReply) {
    const params = patientIdParamsSchema.parse(req.params);
    const appointments = await findDetailedAppointments({
      patientId: params.patientId,
    });

    return res.status(200).send({
      appointments: appointments.map(toDetailedAppointmentDto),
    });
  }

  async listDetailedByDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamsSchema.parse(req.params);
    const appointments = await findDetailedAppointments({
      doctorId: params.doctorId,
    });

    return res.status(200).send({
      appointments: appointments.map(toDetailedAppointmentDto),
    });
  }

  async listAvailableSlots(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamsSchema.parse(req.params);
    const query = availableSlotsQuerySchema.parse(req.query);
    const payload: Parameters<
      ListDoctorAvailableSlotsUseCase["execute"]
    >[0] = {
      doctorId: params.doctorId,
      date: query.date,
    };
    if (query.durationMinutes !== undefined) {
      payload.durationMinutes = query.durationMinutes;
    }
    const slots = await this.listDoctorAvailableSlotsUseCase.execute(payload);
    return res.status(200).send({ slots });
  }
}
