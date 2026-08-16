import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { CreateAppointmentUseCase } from "../../app/usecases/CreateAppointmentUseCase";
import { CancelAppointmentUseCase } from "../../app/usecases/CancelAppointmentUseCase";
import { ListPatientAppointmentsUseCase } from "../../app/usecases/ListPatientAppointmentsUseCase";
import { ListDoctorAppointmentsUseCase } from "../../app/usecases/ListDoctorAppointmentsUseCase";
import {
  appointmentIdParamsSchema,
  clinicIdParamsSchema,
  createAppointmentBodySchema,
  doctorIdParamsSchema,
  patientIdParamsSchema,
  updateAppointmentNotesSchema,
} from "../schemas/appointmentSchemas";
import { prisma } from "../../lib/prisma";
import { Auth } from "../auth/authDecorator";

function toAppointmentDto(appointment: Appointment) {
  return {
    id: appointment.id.value,
    patientId: appointment.props.patientId.value,
    doctorId: appointment.props.doctorId.value,
    startTime: appointment.props.startTime.toString(),
    endTime: appointment.props.endTime.toString(),
    day: appointment.props.day.date.toISOString(),
    status: appointment.props.status,
    reason: appointment.props.reason ?? null,
    notes: appointment.props.notes ?? null,
    type: appointment.props.type,
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
    type: row.type,
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
          street: row.doctor.clinic.street,
          number: row.doctor.clinic.number,
          city: row.doctor.clinic.city,
          state: row.doctor.clinic.state,
          cep: row.doctor.clinic.cep,
          address: [
            row.doctor.clinic.street,
            row.doctor.clinic.number,
            row.doctor.clinic.city,
            row.doctor.clinic.state,
          ].filter(Boolean).join(", "),
        }
      : null,
    patient: {
      id: row.patient.id,
      name: row.patient.name,
      phone: row.patient.phone,
    },
  };
}

function findDetailedAppointments(where: {
  patientId?: string;
  doctorId?: string;
  doctor?: { clinicId: string };
}) {
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
    private readonly listDoctorAppointmentsUseCase: ListDoctorAppointmentsUseCase
   
  ) {}

  @Auth("PATIENT")
  async create(req: FastifyRequest, res: FastifyReply) {
    const body = createAppointmentBodySchema.parse(req.body);
    const patientId = req.session.profileId;

    if (!patientId) {
      return res.status(401).send({ message: "Sessao de paciente invalida" });
    }

    const created = await this.createAppointmentUseCase.execute({
      patientId,
      doctorId: body.doctorId,
      startTime: body.startTime,
      endTime: body.endTime,
      day: new Date(body.day),
      reason: body.reason ?? null,
      notes: body.notes ?? null,
      type: body.type,
    });
    return res.status(201).send({ appointment: toAppointmentDto(created) });
  }

  @Auth("PATIENT", "DOCTOR", "CLINIC")
  async cancel(req: FastifyRequest, res: FastifyReply) {
    const params = appointmentIdParamsSchema.parse(req.params);
    if (!req.session.role || !req.session.profileId) {
      return res.status(401).send({ message: "Sessao invalida" });
    }
    const updated = await this.cancelAppointmentUseCase.execute(params.id, {
      role: req.session.role,
      profileId: req.session.profileId,
    });
    return res.status(200).send({ appointment: toAppointmentDto(updated) });
  }


  @Auth("PATIENT")
  async listByPatient(req: FastifyRequest, res: FastifyReply) {
    const params = patientIdParamsSchema.parse(req.params);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de paciente invalida" });
    }

    if (req.session.profileId !== params.patientId) {
      return res.status(403).send({ message: "Voce nao pode acessar consultas de outro paciente" });
    }

    const list = await this.listPatientAppointmentsUseCase.execute(
      params.patientId,
    );
    return res.status(200).send({
      appointments: list.map(toAppointmentDto),
    });
  }

  @Auth("DOCTOR")
  async listByDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamsSchema.parse(req.params);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de medico invalida" });
    }

    if (req.session.profileId !== params.doctorId) {
      return res.status(403).send({ message: "Voce nao pode acessar consultas de outro medico" });
    }

    const list = await this.listDoctorAppointmentsUseCase.execute(
      params.doctorId,
    );
    return res.status(200).send({
      appointments: list.map(toAppointmentDto),
    });
  }

  @Auth("PATIENT")
  async listDetailedByPatient(req: FastifyRequest, res: FastifyReply) {
    const params = patientIdParamsSchema.parse(req.params);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de paciente invalida" });
    }

    if (req.session.profileId !== params.patientId) {
      return res.status(403).send({ message: "Voce nao pode acessar consultas de outro paciente" });
    }

    const appointments = await findDetailedAppointments({
      patientId: params.patientId,
    });

    return res.status(200).send({
      appointments: appointments.map(toDetailedAppointmentDto),
    });
  }

  @Auth("DOCTOR")
  async listDetailedByDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamsSchema.parse(req.params);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de medico invalida" });
    }

    if (req.session.profileId !== params.doctorId) {
      return res.status(403).send({ message: "Voce nao pode acessar consultas de outro medico" });
    }

    const appointments = await findDetailedAppointments({
      doctorId: params.doctorId,
    });

    return res.status(200).send({
      appointments: appointments.map(toDetailedAppointmentDto),
    });
  }

  @Auth("DOCTOR")
  async updateNotes(req: FastifyRequest, res: FastifyReply) {
    const params = appointmentIdParamsSchema.parse(req.params);
    const body = updateAppointmentNotesSchema.parse(req.body);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de medico invalida" });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      select: { doctorId: true, status: true },
    });
    if (!appointment) {
      return res.status(404).send({ message: "Consulta nao encontrada" });
    }
    if (appointment.doctorId !== req.session.profileId) {
      return res.status(403).send({ message: "Voce nao pode anotar consulta de outro medico" });
    }
    if (appointment.status !== "OCURRING" && appointment.status !== "COMPLETED") {
      return res.status(409).send({ message: "A anotacao so pode ser adicionada durante ou depois da consulta" });
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: { notes: body.notes },
      select: { id: true, notes: true },
    });
    return res.status(200).send({ appointment: updated, message: "Anotacao salva com sucesso" });
  }

  @Auth("CLINIC")
  async listDetailedByClinic(req: FastifyRequest, res: FastifyReply) {
    const params = clinicIdParamsSchema.parse(req.params);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de clinica invalida" });
    }
    if (req.session.profileId !== params.clinicId) {
      return res.status(403).send({ message: "Voce nao pode acessar consultas de outra clinica" });
    }
    const appointments = await findDetailedAppointments({
      doctor: { clinicId: params.clinicId },
    });
    return res.status(200).send({
      appointments: appointments.map(toDetailedAppointmentDto),
    });
  }

  
}
