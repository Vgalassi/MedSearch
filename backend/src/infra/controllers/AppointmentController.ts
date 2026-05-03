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

function toAppointmentDto(appointment: Appointment) {
  return {
    id: appointment.id.value,
    patientId: appointment.props.patientId.value,
    doctorId: appointment.props.doctorId.value,
    startTime: appointment.props.startTime.toISOString(),
    endTime: appointment.props.endTime.toISOString(),
    status: appointment.props.status,
    reason: appointment.props.reason ?? null,
    notes: appointment.props.notes ?? null,
  };
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
