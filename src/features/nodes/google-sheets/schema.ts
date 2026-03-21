import { z } from "zod";

const MappingSchema = z.object({
  jsonPath: z.string().min(1),
  variableName: z.string().min(1),
  scope: z.enum(["session", "contact"]),
});

export const GoogleSheetsNodeSchema = z.object({
  credentialId: z.string().optional(),
  action: z.enum(["insert_row", "update_row", "get_row"]).default("insert_row"),
  spreadsheetId: z.string().optional(),
  spreadsheetName: z.string().optional(),
  sheetId: z.string().optional(),
  sheetName: z.string().optional(),
  rowId: z.number().int().positive().optional(),
  values: z.record(z.string(), z.unknown()).optional(),
  filter: z.record(z.string(), z.unknown()).optional(),
  timeoutMs: z.number().int().positive().optional(),
  responseMapping: z.array(MappingSchema).optional(),
});

export type GoogleSheetsNodeData = z.infer<typeof GoogleSheetsNodeSchema>;
