import { z } from "zod";

export const EndNodeSchema = z.object({});

export type EndNodeData = z.infer<typeof EndNodeSchema>;
