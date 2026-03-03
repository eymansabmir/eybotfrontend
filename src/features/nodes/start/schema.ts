import { z } from "zod";

export const StartNodeSchema = z.object({});

export type StartNodeData = z.infer<typeof StartNodeSchema>;
