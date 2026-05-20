import type { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import session from "@fastify/session";


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