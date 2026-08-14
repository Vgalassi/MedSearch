import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";

@injectable()
export class CancelAppointmentUseCase {
  constructor(
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(
    appointmentId: string,
    actor: { role: "PATIENT" | "DOCTOR" | "CLINIC"; profileId: string },
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotfoundError("Appointment", appointmentId);
    }

    if (!(await this.appointmentRepository.canBeManagedBy(appointmentId, actor))) {
      throw new UnauthorizedError();
    }

    appointment.cancel();
    return this.appointmentRepository.update(appointment);
  }
}
