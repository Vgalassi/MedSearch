import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";

@injectable()
export class CancelAppointmentUseCase {
  constructor(
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotfoundError("Appointment", appointmentId);
    }

    appointment.cancel();
    return this.appointmentRepository.update(appointment);
  }
}
