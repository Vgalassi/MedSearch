import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { UseCase } from "../../domain/value-objects/UseCase";
import { getAvaliableDayTimes} from "../../domain/services/avaliabilityService";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { Time } from "../../domain/value-objects/Time";
type Input= {
    day: Date,
    doctorId: string
}

@injectable()
export class GetDoctorAvailableHoursUseCase
  implements UseCase<Input, Promise<Time[]>>
{
  constructor(
    @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
    @inject(TYPES.AppointmentRepository) private readonly appointmentRepository: AppointmentRepository
  ) {}

  async execute(input: Input): Promise<Time[]> {
    const doctor = await this.doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", input.doctorId);
    }
    console.log(input.day);
    const appointments = await this.appointmentRepository.findScheduledByDoctor(input.doctorId)
    const hours = getAvaliableDayTimes(appointments,input.day,doctor);

    if(hours.length === 0){
        throw Error("There is no available hours on this day")
    }
    return hours
  }
}
