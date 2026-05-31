import { z } from "zod";

export const createAppointmentBodySchema = z.object({
  patientId: z.uuid().optional(),
  doctorId: z.uuid(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  day: z.iso.date(),
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
