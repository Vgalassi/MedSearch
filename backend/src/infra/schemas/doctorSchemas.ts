import { z } from "zod";

export const doctorIdParamSchema = z.object({
  id: z.uuid(),
});
