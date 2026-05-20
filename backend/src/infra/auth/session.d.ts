import "fastify";

declare module "fastify" {
  interface Session {
    userId?: string;
    role?: "DOCTOR" | "PATIENT" | "CLINIC";
  }
}
