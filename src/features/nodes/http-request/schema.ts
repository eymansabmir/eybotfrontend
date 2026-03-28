import { z } from "zod";

const MappingSchema = z.object({
  jsonPath: z.string().min(1),
  variableName: z.string().min(1),
  scope: z.enum(["session", "contact"]),
});

export const HttpRequestNodeSchema = z.object({
  url: z.string().url("URL must be valid"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("GET"),
  headers: z.record(z.string(), z.string()).optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  timeoutMs: z.number().int().positive().optional(),
  fallbackText: z.string().optional(),
  responseMapping: z.array(MappingSchema).optional(),
  credentialId: z.string().optional(),
  proxyCredentialsId: z.string().optional(),
});

export type HttpRequestNodeData = z.infer<typeof HttpRequestNodeSchema>;
