import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";

@injectable()
export class GetAllClinicsUseCase {
  constructor(
    @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
  ) {}

  async execute() {
    return this.clinicRepository.findAll();
  }
}
