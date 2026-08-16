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
  cep: z.string().min(8),
  number: z.string().min(1),
  description: z.string().min(5),
});

export const registerUserSchema = z.discriminatedUnion("role", [
  doctorSchema,
  patientSchema,
  clinicSchema,
]);

const editableProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
});

export const updatePatientProfileSchema = editableProfileSchema;

export const updateDoctorProfileSchema = editableProfileSchema.extend({
  speciality: z.string().trim().min(2).max(80),
});

export const updateClinicProfileSchema = editableProfileSchema.extend({
  cep: z.string().trim().min(8).max(9),
  number: z.string().trim().min(1).max(20),
  description: z.string().trim().min(5).max(2000),
});
