import type { FastifyInstance } from "fastify";
import type { IncomingMessage } from "node:http";
import cookie from "@fastify/cookie";
import session from "@fastify/session";

export type WebSocketSessionUser = {
    profileId: string;
    role: "DOCTOR" | "PATIENT";
};


export async function setupSession(app:FastifyInstance){
    await app.register(cookie);

    const secret = process.env.SESSION_SECRET;
    if (!secret) {
        throw new Error("A variável de ambiente SESSION_SECRET não foi definida!");
    }
    await app.register(session, {
    secret:
        secret,
        
    cookie: {
        secure: false, 
        httpOnly: true,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24
    },

    saveUninitialized: false
    });
}

export function createWebSocketAuthenticator(app: FastifyInstance) {
    return async (request: IncomingMessage): Promise<WebSocketSessionUser | null> => {
        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) {
            return null;
        }

        const sessionId = app.parseCookie(cookieHeader).sessionId;
        if (!sessionId) {
            return null;
        }

        const sessionRequest: { session?: import("fastify").Session } = {};

        await new Promise<void>((resolve, reject) => {
            app.decryptSession(sessionId, sessionRequest, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });

        const currentSession = sessionRequest.session;
        if (
            !currentSession?.userId ||
            !currentSession.profileId ||
            (currentSession.role !== "DOCTOR" && currentSession.role !== "PATIENT")
        ) {
            return null;
        }

        return {
            profileId: currentSession.profileId,
            role: currentSession.role,
        };
    };
}
