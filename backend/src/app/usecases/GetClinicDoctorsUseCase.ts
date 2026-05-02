import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { NotfoundError } from "../../domain/errors/NotFoundError";

@injectable()
export class GetClinicDoctorsUseCase {
  constructor(
    @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
    @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(clinicId: string) {
    const clinic = await this.clinicRepository.findById(clinicId);
    if (!clinic) {
      throw new NotfoundError("Clinic", clinicId);
    }

    return this.doctorRepository.findByClinicId(clinicId);
  }
}
