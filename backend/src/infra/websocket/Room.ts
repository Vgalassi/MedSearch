import { Identifier } from "../../domain/value-objects/Identifier";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";
import type { WebSocket } from "ws";

export type ParticipantRole =
    | "DOCTOR"
    | "PATIENT";

export type DoctorParticipant = {
    doctorId: Identifier;
    socket: WebSocket;
};

export type PatientParticipant = {
    patientId: Identifier;
    socket: WebSocket;
};

export class Room {

    private doctorParticipant: DoctorParticipant | null = null;

    private patientParticipant: PatientParticipant | null = null;

    constructor(
        private readonly appointmentId: Identifier
    ) { }

    getAppointmentId(): Identifier {
        return this.appointmentId;
    }

    join(profileId: Identifier, role: ParticipantRole, socket: WebSocket) {
        if (role === "DOCTOR") {
            if (this.doctorParticipant && this.doctorParticipant.doctorId.value !== profileId.value) {
                throw new UnauthorizedError();
            }
            this.doctorParticipant = {doctorId: profileId,socket};
            return;
        }
        if (role === "PATIENT") {
            if (this.patientParticipant && this.patientParticipant.patientId.value !== profileId.value ) {
                throw new UnauthorizedError();
            }
            this.patientParticipant = {patientId: profileId,socket};
            return;
        }
        throw new UnauthorizedError();
    }

    leave(role: ParticipantRole) {
        if (role === "DOCTOR") {
            this.doctorParticipant = null;
            return;
        }
        this.patientParticipant = null;
    }

    isReady(): boolean {
        return !!(this.doctorParticipant && this.patientParticipant);
    }

    isEmpty(): boolean {
        return (!this.doctorParticipant && !this.patientParticipant);
    }

    getParticipantCount(): number {
        let count = 0;

        if (this.doctorParticipant) {
            count++;
        }

        if (this.patientParticipant) {
            count++;
        }
        return count;
    }

    getDoctor() {
        return this.doctorParticipant;
    }

    getPatient() {
        return this.patientParticipant;
    }

    getOtherParticipant(role: ParticipantRole) {
        if (role === "DOCTOR") {
            return this.patientParticipant;
        }

        return this.doctorParticipant;
    }
}
