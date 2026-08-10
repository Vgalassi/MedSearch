import { z } from "zod";

export const symptomsAnalysisSchema = z.object({
  symptoms: z.string().trim().min(5).max(2000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
