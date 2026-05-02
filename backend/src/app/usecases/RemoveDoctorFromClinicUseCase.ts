import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { NotfoundError } from "../../domain/errors/NotFoundError";

type RemoveDoctorFromClinicInput = {
  clinicId: string;
  doctorId: string;
};

@injectable()
export class RemoveDoctorFromClinicUseCase {
  constructor(
    @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
    @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute(input: RemoveDoctorFromClinicInput) {
    const clinic = await this.clinicRepository.findById(input.clinicId);
    if (!clinic) {
      throw new NotfoundError("Clinic", input.clinicId);
    }

    const doctor = await this.doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", input.doctorId);
    }

    const updatedDoctor = clinic.removeDoctor(doctor);
    return this.doctorRepository.update(updatedDoctor);
  }
}
