import type { FastifyReply, FastifyRequest } from "fastify";
import { inject, injectable } from "inversify";
import { TYPES } from "../../app/dto/types";
import { GetAllDoctorsUseCase } from "../../app/usecases/GetAllDoctorsUseCase";

@injectable()
export class DoctorController {
  constructor(
    @inject(TYPES.GetAllDoctorsUseCase)
    private readonly getAllDoctorsUseCase: GetAllDoctorsUseCase,
  ) {}

  async getAll(req: FastifyRequest, res: FastifyReply) {
    const doctors = await this.getAllDoctorsUseCase.execute();

    return res.status(200).send({
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
}
