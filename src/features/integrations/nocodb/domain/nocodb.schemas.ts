import { z } from 'zod';

export const NocoDBCredentialSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
  isTested: z.boolean().default(false),
});

export type NocoDBCredential = z.infer<typeof NocoDBCredentialSchema>;
