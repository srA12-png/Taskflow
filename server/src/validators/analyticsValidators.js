import { z } from "zod";

export const summaryQuerySchema = z.object({
  tzOffset: z.coerce.number().int().min(-840).max(840).default(0),
});

export const completionsQuerySchema = z.object({
  tzOffset: z.coerce.number().int().min(-840).max(840).default(0),
  days: z.coerce.number().int().min(1).max(30).default(7),
});
