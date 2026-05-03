import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";

@injectable()
export class GetAllDoctorsUseCase {
  constructor(
    @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
  ) {}

  async execute() {
    return this.doctorRepository.findAll();
  }
}
