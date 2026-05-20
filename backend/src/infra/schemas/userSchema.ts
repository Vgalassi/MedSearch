import { email, z } from "zod";

const baseSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6)
})

const doctorSchema = baseSchema.extend({
  role: z.literal("DOCTOR"),
  crm: z.string().min(3),
  speciality: z.string().min(2),
  clinicId: z.uuid().optional(),
});

const patientSchema = baseSchema.extend({
  role: z.literal("PATIENT"),
  cpf: z.string().min(11),
});

const clinicSchema = baseSchema.extend({
  role: z.literal("CLINIC"),
  address: z.string().min(5),
  cep: z.string().min(8),
  latitude: z.number(),
  longitude: z.number(),
  description: z.string().min(5),
});

export const registerUserSchema = z.discriminatedUnion("role", [
  doctorSchema,
  patientSchema,
  clinicSchema,
]);
