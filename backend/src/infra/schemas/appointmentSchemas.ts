import { z } from "zod";

export const createAppointmentBodySchema = z.object({
  patientId: z.uuid(),
  doctorId: z.uuid(),
  startTime: z.iso.datetime(),
  endTime: z.iso.datetime(),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const appointmentIdParamsSchema = z.object({
  id: z.uuid(),
});

export const patientIdParamsSchema = z.object({
  patientId: z.uuid(),
});

export const doctorIdParamsSchema = z.object({
  doctorId: z.uuid(),
});

export const availableSlotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationMinutes: z.coerce.number().int().positive().optional(),
});
