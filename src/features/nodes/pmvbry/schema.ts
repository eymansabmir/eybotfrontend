import { z } from "zod";

const MappingSchema = z.object({
  jsonPath: z.string().min(1),
  variableName: z.string().min(1),
  scope: z.enum(["session", "contact"]),
});

export const PmvbryNodeSchema = z.object({
  mobileNumber: z.string().min(1, "Mobile Number is required"),
  statusVariableName: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
  responseMapping: z.array(MappingSchema).optional(),
});

export type PmvbryNodeData = z.infer<typeof PmvbryNodeSchema>;
