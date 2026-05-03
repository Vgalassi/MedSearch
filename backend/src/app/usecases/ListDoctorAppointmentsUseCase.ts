import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";

@injectable()
export class ListDoctorAppointmentsUseCase {
  constructor(
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(doctorId: string): Promise<Appointment[]> {
    const doctor = await this.doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", doctorId);
    }

    return this.appointmentRepository.findByDoctorId(doctorId);
  }
}
