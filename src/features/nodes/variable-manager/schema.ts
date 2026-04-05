import { z } from "zod";

export const VariableManagerNodeSchema = z.object({});

export type VariableManagerNodeData = z.infer<typeof VariableManagerNodeSchema>;
