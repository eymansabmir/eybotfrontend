import { z } from "zod";

export const GoogleSheetsCredentialMetadataSchema = z.object({
  clientEmail: z.string().optional(),
});

export const GoogleSheetsCredentialSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string(),
  type: z.literal("GOOGLE_SHEETS"),
  isActive: z.boolean(),
  // Backend sends lastTestedAt (nullable ISO string), transform to boolean isTested
  lastTestedAt: z.union([z.string(), z.null()]).optional(),
  metadata: GoogleSheetsCredentialMetadataSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).transform((data) => ({
  ...data,
  isTested: data.lastTestedAt != null,
}));

export const GoogleSheetsCredentialsListSchema = z.array(GoogleSheetsCredentialSchema);

export const GoogleSheetsTestConnectionSchema = z.object({
  ok: z.boolean(),
  latencyMs: z.number(),
  statusCode: z.number().optional(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
});

export const GoogleSheetsAccessTokenSchema = z.object({
  accessToken: z.string().min(1),
});

export const GoogleSpreadsheetInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const GoogleSheetInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  index: z.number(),
});
