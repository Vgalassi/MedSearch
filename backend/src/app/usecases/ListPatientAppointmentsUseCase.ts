import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";

@injectable()
export class ListPatientAppointmentsUseCase {
  constructor(
    @inject(TYPES.PatientRepository)
    private readonly patientRepository: PatientRepository,
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(patientId: string): Promise<Appointment[]> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient) {
      throw new NotfoundError("Patient", patientId);
    }

    return this.appointmentRepository.findByPatientId(patientId);
  }
}
