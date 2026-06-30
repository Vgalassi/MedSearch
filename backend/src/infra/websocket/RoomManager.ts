import { Room } from "./Room";
import { Identifier } from "../../domain/value-objects/Identifier";
import type { WebSocket } from "ws";
import type { ParticipantRole } from "./Room";

export type Participant = {
    profileId: string;
    role: "DOCTOR" | "PATIENT";
    socket: WebSocket;
};

export class RoomManager {

    private readonly rooms = new Map<string, Room>();

    joinRoom( appointmentId: string,participant: Participant): Room {

        let room = this.rooms.get(
            appointmentId
        );

        if (!room) {
            room = new Room(new Identifier(appointmentId));
            this.rooms.set(appointmentId,room);
        }

        room.join(new Identifier(participant.profileId),participant.role,participant.socket);

        return room;
    }

    leave(appointmentId: string,role: ParticipantRole) {
        const room = this.rooms.get(appointmentId);
        if (!room) {
            return;
        }

        room.leave(role);

        if (room.getParticipantCount() === 0) {
            this.rooms.delete(
                appointmentId
            );
        }
    }

    getRoom(appointmentId: string): Room | undefined {
        return this.rooms.get(
            appointmentId
        );
    }

    roomExists(appointmentId: string): boolean {
        return this.rooms.has(
            appointmentId
        );
    }

    removeRoom(appointmentId: string) {
        this.rooms.delete(
            appointmentId
        );
    }
}
