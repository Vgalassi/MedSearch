import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import { Appointment, type appointmentType } from "../../domain/Aggregates/Appointment";
import { NotfoundError } from "../../domain/errors/NotFoundError";
import { DoctorSettingsNotFoundError } from "../../domain/errors/DoctorSettingsNotFoundError";
import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";
import type { AvailabilityRepository } from "../../domain/repositories/AvailabilityRepository";
import type { DoctorSettingsRepository } from "../../domain/repositories/DoctorSettingsRepository";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";
import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import { getAvaliableDayTimes } from "../../domain/services/avaliabilityService";
import { Identifier } from "../../domain/value-objects/Identifier";
import { Time } from "../../domain/value-objects/Time";
import { AppointmentOutsideAvailabilityError } from "../../domain/errors/AppointmentOutsideAvailabilityError";
import { TimeZoneDate } from "../../domain/value-objects/TimeZoneDate";
import { PatientAlreadyHasScheduledAppointmentError } from "../../domain/errors/PatientAlreadyHasScheduledAppointmentError";
export type CreateAppointmentInput = {
  patientId: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  day: Date;
  reason?: string | null;
  notes?: string | null;
  type: appointmentType;
};

@injectable()
export class CreateAppointmentUseCase {
  constructor(
    @inject(TYPES.PatientRepository)
    private readonly patientRepository: PatientRepository,
    @inject(TYPES.DoctorRepository)
    private readonly doctorRepository: DoctorRepository,
    @inject(TYPES.DoctorSettingsRepository)
    private readonly doctorSettingsRepository: DoctorSettingsRepository,
    @inject(TYPES.AvailabilityRepository)
    private readonly availabilityRepository: AvailabilityRepository,
    @inject(TYPES.AppointmentRepository)
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const patient = await this.patientRepository.findById(input.patientId);
    if (!patient) {
      throw new NotfoundError("Patient", input.patientId);
    }

    const doctor = await this.doctorRepository.findById(input.doctorId);
    if (!doctor) {
      throw new NotfoundError("Doctor", input.doctorId);
    }

    const settings = await this.doctorSettingsRepository.findByDoctorId(
      input.doctorId,
    );
    if (!settings) {
      throw new DoctorSettingsNotFoundError(input.doctorId);
    }

    const alreadyScheduled =
      await this.appointmentRepository.hasScheduledByPatientAndDoctor(
        input.patientId,
        input.doctorId,
      );
    if (alreadyScheduled) {
      throw new PatientAlreadyHasScheduledAppointmentError();
    }
    
    
    const appointmentDate = new TimeZoneDate(input.day,false)
    
    const appointments = await this.appointmentRepository.findScheduledByDoctor(input.doctorId)
    const slots = getAvaliableDayTimes(appointments,appointmentDate,doctor)

    const startTime = Time.createWithString(input.startTime)
    const endTime = Time.createWithString(input.endTime)
    if(!this.checkSlots(slots,startTime,input.type)){
      throw new AppointmentOutsideAvailabilityError
    }
    

    const appointment = Appointment.createScheduled({
      patientId: new Identifier(input.patientId),
      doctorId: new Identifier(input.doctorId),
      startTime: startTime,
      endTime: endTime,
      day: appointmentDate,
      reason: input.reason ?? null,
      notes: input.notes ?? null,
      type: input.type,
    });

    return this.appointmentRepository.create(appointment);
  }


  checkSlots(slots: ReturnType<typeof getAvaliableDayTimes>,startTime: Time,type: appointmentType): boolean{
    for(const slot of slots){
      if(slot.startTime.value == startTime.value && (slot.mode === "BOTH" || slot.mode === type)){
        return true
      }
    }
    return false
  }
}
