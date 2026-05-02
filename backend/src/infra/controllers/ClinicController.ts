import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { AddDoctorToClinicUseCase } from "../../app/usecases/AddDoctorToClinicUseCase";
import { RemoveDoctorFromClinicUseCase } from "../../app/usecases/RemoveDoctorFromClinicUseCase";
import {
  clinicDoctorBodySchema,
  clinicDoctorParamsSchema,
} from "../schemas/clinicDoctorSchema";

@injectable()
export class ClinicController {
  constructor(
    @inject(TYPES.AddDoctorToClinicUseCase)
    private readonly addDoctorToClinicUseCase: AddDoctorToClinicUseCase,
    @inject(TYPES.RemoveDoctorFromClinicUseCase)
    private readonly removeDoctorFromClinicUseCase: RemoveDoctorFromClinicUseCase,
  ) {}

  async addDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = clinicDoctorParamsSchema.parse(req.params);
    const body = clinicDoctorBodySchema.parse(req.body);

    const doctor = await this.addDoctorToClinicUseCase.execute({
      clinicId: params.id,
      doctorId: body.doctorId,
    });

    return res.status(200).send({
      message: "Doctor added to clinic",
      doctorId: doctor.id.value,
      clinicId: doctor.props.clinicId?.value ?? null,
    });
  }

  async removeDoctor(req: FastifyRequest, res: FastifyReply) {
    const params = clinicDoctorParamsSchema.parse(req.params);
    const body = clinicDoctorBodySchema.parse(req.body);

    const doctor = await this.removeDoctorFromClinicUseCase.execute({
      clinicId: params.id,
      doctorId: body.doctorId,
    });

    return res.status(200).send({
      message: "Doctor removed from clinic",
      doctorId: doctor.id.value,
      clinicId: doctor.props.clinicId?.value ?? null,
    });
  }
}
