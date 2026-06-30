import type { AppointmentRepository } from "../../domain/repositories/AppointmentRepository";

import type { UseCase } from "../../domain/value-objects/UseCase";
import { inject, injectable } from "inversify";
import { TYPES } from "../dto/types";
import { NotfoundError } from "../../domain/errors/NotFoundError";

import type { DoctorRepository } from "../../domain/repositories/DoctorRepository";
import type { PatientRepository } from "../../domain/repositories/PatientRepository";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";



export type joinCallInput = {
    appointmentId: string
    profileId: string
    role: string
}



@injectable()
export class JoinCallUseCase implements UseCase<joinCallInput, void> {

    constructor(
        @inject(TYPES.AppointmentRepository) private readonly appointmentRepository: AppointmentRepository
    ) { }
    async execute({ appointmentId, profileId, role }: joinCallInput) {
        const appointment = await this.appointmentRepository.findById(appointmentId)
        if (!appointment) {
            throw new NotfoundError("appointment", appointmentId)
        }

        if(appointment.props.type != "ONLINE"){
            throw new Error("Appointment does not suport video calls")
        }

        if(role === "PATIENT" && appointment.props.patientId.value != profileId){
            throw new UnauthorizedError
        }

        if(role === "DOCTOR" && appointment.props.doctorId.value != profileId){
            throw new UnauthorizedError
        }

    }



}