import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";

@injectable()
export class GetDoctorSchedulingUseCase {
  constructor(
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(doctorId: string) {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", doctorId);
    }

    return doctor;
  }
}
