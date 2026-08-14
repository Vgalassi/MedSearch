import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";
import { GetDoctorAvailableDaysUseCase } from "../../app/usecases/GetDoctorAvailableDaysUsecase";
import {
  doctorAvailableHoursSchema,
  doctorIdParamSchema,
  updateDoctorSchedulingSchema,
} from "../schemas/doctorSchemas";
import { GetDoctorAvailableHoursUseCase } from "../../app/usecases/GetAvailableHoursUseCase";
import { GetDoctorSchedulingUseCase } from "../../app/usecases/GetDoctorSchedulingUseCase";
import { UpdateDoctorSchedulingUseCase } from "../../app/usecases/UpdateDoctorSchedulingUseCase";
import { Auth } from "../auth/authDecorator";
import { TimeZoneDate } from "../../domain/value-objects/TimeZoneDate";

function toSchedulingDto(
  doctor: Awaited<ReturnType<GetDoctorSchedulingUseCase["execute"]>>,
) {
  return {
    doctorId: doctor.id.value,
    settings: doctor.props.schedulingSettings
      ? {
          isAvaliable: doctor.props.schedulingSettings.props.isAvaliable,
          defaultDuration:
            doctor.props.schedulingSettings.props.defaultDuration.toString(),
          bufferBetween:
            doctor.props.schedulingSettings.props.bufferBetween.toString(),
          advanceBookingHours:
            doctor.props.schedulingSettings.props.advanceBookingHours,
          maxSchedulingDays:
            doctor.props.schedulingSettings.props.maxSchedulingDays,
          maxDailyAppointments:
            doctor.props.schedulingSettings.props.maxDailyAppointments,
        }
      : null,
    availabilities:
      doctor.props.Availabilities?.map((availability) => ({
        id: availability.id.value,
        weekdays: availability.props.weekDayRange.range.map(
          (weekday) => weekday.value,
        ),
        startTime: availability.props.startTime.toString(),
        endTime: availability.props.endTime.toString(),
        mode: availability.props.mode.value,
      })) ?? [],
  };
}

@injectable()
export class DoctorController {
  constructor(
    @inject(TYPES.GetAllDoctorsUseCase)
    private readonly getAllDoctorsUseCase: GetAllDoctorsUseCase,
    @inject(TYPES.GetDoctorAvailableDaysUseCase)
    private readonly getDoctorAvailableDaysUseCase: GetDoctorAvailableDaysUseCase,
    @inject(TYPES.GetDoctorAvailableHoursUseCase)
    private readonly getDoctorAvailableHoursUseCase: GetDoctorAvailableHoursUseCase,
    @inject(TYPES.GetDoctorSchedulingUseCase)
    private readonly getDoctorSchedulingUseCase: GetDoctorSchedulingUseCase,
    @inject(TYPES.UpdateDoctorSchedulingUseCase)
    private readonly updateDoctorSchedulingUseCase: UpdateDoctorSchedulingUseCase,
  ) {}

  async getAll(req: FastifyRequest, res: FastifyReply) {
    const doctors = await this.getAllDoctorsUseCase.execute();

    return res.status(200).send({
      doctors: doctors.map((doctor) => ({
        id: doctor.id.value,
        userId: doctor.props.userId.value,
        name: doctor.props.name,
        phone: doctor.props.phone.value,
        crm: doctor.props.crm,
        speciality: doctor.props.speciality,
        clinicId: doctor.props.clinicId?.value ?? null,
      })),
    });
  }
  @Auth("PATIENT")
  async getAvailableDays(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamSchema.parse(req.params);
    const days = await this.getDoctorAvailableDaysUseCase.execute(params.id);

    return res.status(200).send({
      doctorId: params.id,
      days: days.map((day) => day.date),
    });
  }

  @Auth("PATIENT")
  async getAvailableHours(req: FastifyRequest,res: FastifyReply){
    const params = doctorIdParamSchema.parse(req.params)
    const body = doctorAvailableHoursSchema.parse(req.body)
   
    const hours = await this.getDoctorAvailableHoursUseCase.execute({
      day: TimeZoneDate.fromDateString(body.date),
      doctorId: params.id
     })

    return res.status(200).send({
      doctorId: params.id,
      hours: hours.map((hour) => ({
        startTime: hour.startTime.toString(),
        endTime: hour.endTime.toString(),
        mode: hour.mode,
      })),
    });
  }

  @Auth("DOCTOR")
  async updateScheduling(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamSchema.parse(req.params);
    const body = updateDoctorSchedulingSchema.parse(req.body);
    if (!req.session.profileId) {
      return res.status(401).send({ message: "Sessao de medico invalida" });
    }

    if (req.session.profileId !== params.id) {
      return res.status(403).send({ message: "Voce nao pode alterar agenda de outro medico" });
    }

    const doctor = await this.updateDoctorSchedulingUseCase.execute({
      doctorId: params.id,
      settings: body.settings,
      availabilities: body.availabilities,
    });

    return res.status(200).send(toSchedulingDto(doctor));
  }

  async getScheduling(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamSchema.parse(req.params);
    const doctor = await this.getDoctorSchedulingUseCase.execute(params.id);

    return res.status(200).send(toSchedulingDto(doctor));
  }
}
