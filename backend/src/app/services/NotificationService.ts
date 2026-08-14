import { inject, injectable } from "inversify";
import type { Appointment } from "../../domain/Aggregates/Appointment";
import { Notification } from "../../domain/entities/Notification";
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository";
import { TYPES } from "../dto/types";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";

@injectable()
export class NotificationService {

    constructor(
      @inject(TYPES.NotificationRepository) private readonly notificationRepository: NotificationRepository,
      @inject(TYPES.DoctorRepository) private readonly doctorRepository: DoctorRepository,
      @inject(TYPES.PatientRepository) private readonly patientRepository: PatientRepository
      

    ) {}
  async createAppointmentReminderNotification(appointment: Appointment): Promise<void>{

    const targetDoctor = await this.doctorRepository.findById(appointment.props.doctorId.value)

    if(targetDoctor == null){
      throw new NotfoundError("Doctor", appointment.props.doctorId.value)
    }

    const targetPatient = await this.patientRepository.findById(appointment.props.patientId.value)

    if(targetPatient == null){
      throw new NotfoundError("Patient", appointment.props.patientId.value)
    }


    const doctorNotification = Notification.createAppointmentReminderNotification(targetDoctor.props.userId,appointment)
    const patientNotification = Notification.createAppointmentReminderNotification(targetPatient.props.userId,appointment)

    await this.notificationRepository.save(doctorNotification)
    await this.notificationRepository.save(patientNotification)
  }
}