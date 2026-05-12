import { z } from "zod";

export const ReturnNodeDataSchema = z.object({});

export type ReturnNodeData = z.infer<typeof ReturnNodeDataSchema>;
