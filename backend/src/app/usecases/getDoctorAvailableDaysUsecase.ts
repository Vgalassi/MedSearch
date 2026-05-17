import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { UseCase } from "../../domain/value-objects/UseCase";
import { getAvaliableDays } from "../../domain/services/avaliabilityService";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
@injectable()
export class GetDoctorAvailableDaysUseCase
  implements UseCase<string, Promise<Date[]>>
{
  constructor(
    @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
    @inject(TYPES.AppointmentRepository) private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(doctorId: string): Promise<Date[]> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", doctorId);
    }

    const appointments = await this.appointmentRepository.findScheduledByDoctor(doctorId)

    return getAvaliableDays(doctor,appointments);
  }
}
