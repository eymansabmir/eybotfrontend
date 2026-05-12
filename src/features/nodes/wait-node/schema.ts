import { z } from "zod";

export const waitNodeDataSchema = z.object({
  duration: z.number().min(1).default(1),
  unit: z.enum(["seconds", "minutes", "hours", "days"]).default("minutes"),
});

export type WaitNodeData = z.infer<typeof waitNodeDataSchema>;
