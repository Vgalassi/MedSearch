import { z } from "zod";

export const clinicDoctorParamsSchema = z.object({
  id: z.uuid(),
});

export const clinicDoctorBodySchema = z.object({
  doctorId: z.uuid(),
});
