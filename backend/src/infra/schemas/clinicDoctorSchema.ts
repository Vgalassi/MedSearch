import { z } from "zod";

export const clinicDoctorParamsSchema = z.object({
  id: z.uuid(),
});

export const clinicDoctorBodySchema = z.object({
  doctorId: z.uuid(),
});

export const listClinicsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  search: z.string().trim().min(1).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});
