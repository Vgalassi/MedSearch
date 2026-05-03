import type { UseCase } from "../../domain/value-objects/UseCase"
import { inject, injectable } from "inversify";
import { Clinic } from "../../domain/Aggregates/Clinic"
import { NotfoundError } from "../../domain/errors/NotFoundError"
import { TYPES } from "../dto/types"
import type { ClinicRepository } from "../../domain/repositories/ClinicRepository";

@injectable()
export class FindClinicByIdUseCase implements UseCase<string,Promise<Clinic>>{
    constructor(
        @inject(TYPES.ClinicRepository) private readonly clinicRepository: ClinicRepository,
      ) {}
    
    async execute(id: string): Promise<Clinic> {

        const clinic = await this.clinicRepository.findById(id)
        if (!clinic){
            throw new NotfoundError("Clinic", id)
        }
        return clinic
    }
}