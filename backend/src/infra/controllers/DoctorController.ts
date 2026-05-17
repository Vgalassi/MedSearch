import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";
import { GetDoctorAvailableDaysUseCase } from "../../app/usecases/getDoctorAvailableDaysUsecase";
import { doctorIdParamSchema } from "../schemas/doctorSchemas";

@injectable()
export class DoctorController {
  constructor(
    @inject(TYPES.GetAllDoctorsUseCase)
    private readonly getAllDoctorsUseCase: GetAllDoctorsUseCase,
    @inject(TYPES.GetDoctorAvailableDaysUseCase)
    private readonly getDoctorAvailableDaysUseCase: GetDoctorAvailableDaysUseCase,
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

  async getAvailableDays(req: FastifyRequest, res: FastifyReply) {
    const params = doctorIdParamSchema.parse(req.params);
    const days = await this.getDoctorAvailableDaysUseCase.execute(params.id);

    return res.status(200).send({
      doctorId: params.id,
      days: days.map((day) => day.toISOString()),
    });
  }
}
