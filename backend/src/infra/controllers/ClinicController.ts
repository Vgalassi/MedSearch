import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { AddDoctorToClinicUseCase } from "../../app/usecases/AddDoctorToClinicUseCase";
import { RemoveDoctorFromClinicUseCase } from "../../app/usecases/RemoveDoctorFromClinicUseCase";
import { GetClinicDoctorsUseCase } from "../../app/usecases/GetClinicDoctorsUseCase";
import { GetAllClinicsUseCase } from "../../app/usecases/GetAllClinicsUseCase";
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
    @inject(TYPES.GetClinicDoctorsUseCase)
    private readonly getClinicDoctorsUseCase: GetClinicDoctorsUseCase,
    @inject(TYPES.GetAllClinicsUseCase)
    private readonly getAllClinicsUseCase: GetAllClinicsUseCase,
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

  async getClinicDoctors(req: FastifyRequest, res: FastifyReply) {
    const params = clinicDoctorParamsSchema.parse(req.params);
    const doctors = await this.getClinicDoctorsUseCase.execute(params.id);

    return res.status(200).send({
      clinicId: params.id,
      doctors: doctors.map((doctor) => ({
        id: doctor.id.value,
        userId: doctor.props.userId.value,
        name: doctor.props.name,
        phone: doctor.props.phone,
        crm: doctor.props.crm,
        speciality: doctor.props.speciality,
        clinicId: doctor.props.clinicId?.value ?? null,
      })),
    });
  }

  async getAllClinics(req: FastifyRequest, res: FastifyReply) {
    const clinics = await this.getAllClinicsUseCase.execute();

    return res.status(200).send({
      clinics: clinics.map((clinic) => ({
        id: clinic.id.value,
        userId: clinic.props.userId.value,
        name: clinic.props.name,
        phone: clinic.props.phone,
        address: clinic.props.address,
        cep: clinic.props.cep,
        latitude: clinic.props.latitude,
        longitude: clinic.props.longitude,
        description: clinic.props.description,
      })),
    });
  }
}
