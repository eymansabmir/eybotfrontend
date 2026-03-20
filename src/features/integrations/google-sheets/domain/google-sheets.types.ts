import type { z } from "zod";
import type {
  GoogleSheetsCredentialMetadataSchema,
  GoogleSheetsCredentialSchema,
  GoogleSheetsTestConnectionSchema,
  GoogleSpreadsheetInfoSchema,
  GoogleSheetInfoSchema,
} from "./google-sheets.schemas";

export type GoogleSheetsCredentialMetadata = z.infer<typeof GoogleSheetsCredentialMetadataSchema>;
export type GoogleSheetsCredential = z.infer<typeof GoogleSheetsCredentialSchema>;

export interface CreateGoogleSheetsCredentialInput {
  orgId: string;
  name: string;
  clientEmail: string;
  privateKey: string;
}

export type GoogleSheetsTestConnectionResult = z.infer<typeof GoogleSheetsTestConnectionSchema>;
export type GoogleSpreadsheetInfo = z.infer<typeof GoogleSpreadsheetInfoSchema>;
export type GoogleSheetInfo = z.infer<typeof GoogleSheetInfoSchema>;

export type GoogleSheetsActionMode = "insert_row" | "update_row" | "get_row";
