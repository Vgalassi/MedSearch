import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "./RoomManager";
import { JoinCallUseCase } from "../../app/usecases/JoinCallUseCase";
import type { IncomingMessage as HttpIncomingMessage } from "node:http";
import type { Server as HttpServer } from "node:http";
import type { Server as HttpsServer } from "node:https";
type ParticipantRole =
    | "DOCTOR"
    | "PATIENT";

type SocketUser = {
    profileId: string;
    role: ParticipantRole;
};

type SessionDescriptionPayload = {
    type: "offer" | "answer";
    sdp: string;
};

type IceCandidatePayload = {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
};

type JoinRoomMessage = {
    type: "join-room";
    appointmentId: string;
};

type OfferMessage = {
    type: "offer";
    appointmentId: string;
    sdp: SessionDescriptionPayload;
};

type AnswerMessage = {
    type: "answer";
    appointmentId: string;
    sdp: SessionDescriptionPayload;
};

type IceCandidateMessage = {
    type: "ice-candidate";
    appointmentId: string;
    candidate: IceCandidatePayload;
};

type CallMessage =
    | JoinRoomMessage
    | OfferMessage
    | AnswerMessage
    | IceCandidateMessage;

export interface AuthenticatedSocket extends WebSocket {
    user?: SocketUser;

    appointmentId?: string;
}

type AuthenticateSocket = (
    request: HttpIncomingMessage,
) => SocketUser | null | Promise<SocketUser | null>;

type CallWebSocketServerOptions = {
    authenticate: AuthenticateSocket;
};

export class CallWebSocketServer {

    private readonly wss: WebSocketServer;
    private readonly authenticate: AuthenticateSocket;

    constructor(
        httpServer: HttpServer | HttpsServer,
        private readonly roomManager: RoomManager,
        private readonly joinCallUseCase: JoinCallUseCase,
        options: CallWebSocketServerOptions
    ) {

        this.authenticate = options.authenticate;

        this.wss = new WebSocketServer({
            server: httpServer,
            path: "/ws"
        });

        this.registerEvents();
    }
    private registerEvents() {

        this.wss.on(
            "connection",
            async (socket: AuthenticatedSocket, request) => {

                console.log(
                    "WebSocket connected"
                );

                try {
                    const user = await this.authenticate(request);
                    if (!user) {
                        socket.close(1008, "Authentication required");
                        return;
                    }
                    socket.user = user;
                } catch (error) {
                    console.error("WebSocket authentication error", error);
                    socket.close(1011, "Authentication failed");
                    return;
                }

                socket.on(
                    "message",
                    async (raw: Buffer) => {

                        try {

                            const message =
                                this.parseMessage(raw);

                            await this.handleMessage(
                                socket,
                                message
                            );

                        } catch (error) {

                            console.error(
                                error
                            );

                            socket.send(
                                JSON.stringify({
                                    type: "error",
                                    message:
                                        "Invalid message"
                                })
                            );
                        }
                    }
                );

                socket.on(
                    "close",
                    () => {
                        this.handleDisconnect(
                            socket
                        );
                    }
                );
            }
        );

        this.wss.on(
            "error",
            error => {
                console.error("WebSocket server error", error);
            }
        );
    }

    private async handleMessage(
        socket: AuthenticatedSocket,
        message: CallMessage
    ) {

        switch (message.type) {

            case "join-room":
                await this.handleJoinRoom(
                    socket,
                    message
                );
                break;

            case "offer":
                this.forwardMessage(
                    socket,
                    message.appointmentId,
                    message
                );
                break;

            case "answer":
                this.forwardMessage(
                    socket,
                    message.appointmentId,
                    message
                );
                break;

            case "ice-candidate":
                this.forwardMessage(
                    socket,
                    message.appointmentId,
                    message
                );
                break;
        }
    }

    private async handleJoinRoom(
        socket: AuthenticatedSocket,
        message: JoinRoomMessage
    ) {
        const user = socket.user;

        if (!user) {

            this.send(socket, {
                    type: "error",
                    message:
                        "Unauthenticated socket"
                });

            return;
        }

        socket.user = user;

        await this.joinCallUseCase.execute({
            appointmentId:
                message.appointmentId,

            profileId:
                user.profileId,

            role:
                user.role
        });

        const room =
            this.roomManager.joinRoom(
                message.appointmentId,
                {
                    profileId:
                        user.profileId,

                    role:
                        user.role,

                    socket
                }
            );

        socket.appointmentId =
            message.appointmentId;

        if (room.isReady()) {

            this.send(room.getDoctor()?.socket, {
                type: "start-call",
                initiator: true
            });

            this.send(room.getPatient()?.socket, {
                type: "start-call",
                initiator: false
            });
        }
    }

    private forwardMessage(
        socket: AuthenticatedSocket,
        appointmentId: string,
        payload: unknown
    ) {

        if (!socket.user) {
            return;
        }

        if (socket.appointmentId !== appointmentId) {
            this.send(socket, {
                type: "error",
                message: "Socket is not joined to this room"
            });

            return;
        }

        const room =
            this.roomManager.getRoom(
                appointmentId
            );

        if (!room) {
            return;
        }

        const target =
            room.getOtherParticipant(
                socket.user.role
            );

        this.send(target?.socket, payload);
    }

    private handleDisconnect(
        socket: AuthenticatedSocket
    ) {

        if (
            !socket.user ||
            !socket.appointmentId
        ) {
            return;
        }

        this.roomManager.leave(
            socket.appointmentId,
            socket.user.role
        );

        const room =
            this.roomManager.getRoom(
                socket.appointmentId
            );

        const other =
            room?.getOtherParticipant(
                socket.user.role
            );

        this.send(
            other?.socket,
            {
                type: "participant-left"
            }
        );
    }

    private parseMessage(raw: Buffer): CallMessage {
        const message = JSON.parse(raw.toString()) as Partial<CallMessage>;

        if (
            !message ||
            typeof message.type !== "string" ||
            !this.isKnownMessageType(message.type)
        ) {
            throw new Error("Unknown websocket message type");
        }

        if (
            typeof message.appointmentId !== "string" ||
            message.appointmentId.trim().length === 0
        ) {
            throw new Error("appointmentId is required");
        }

        return message as CallMessage;
    }

    private isKnownMessageType(type: string): type is CallMessage["type"] {
        return [
            "join-room",
            "offer",
            "answer",
            "ice-candidate"
        ].includes(type);
    }

    private send(socket: WebSocket | undefined, payload: unknown) {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }

        socket.send(JSON.stringify(payload));
    }
}
