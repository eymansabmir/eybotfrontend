import { apiClient } from "@/lib/api-client";
import { z } from "zod";
import {
  GoogleSpreadsheetInfoSchema,
  GoogleSheetInfoSchema,
  GoogleSheetsTestConnectionSchema,
  GoogleSheetsAccessTokenSchema,
} from "../domain/google-sheets.schemas";
import type {
  GoogleSpreadsheetInfo,
  GoogleSheetInfo,
  GoogleSheetsTestConnectionResult,
  GoogleSheetsAccessTokenResult,
} from "../domain/google-sheets.types";

export const googleSheetsApi = {
  async testConnection(orgId: string, credentialId: string): Promise<GoogleSheetsTestConnectionResult> {
    const { data } = await apiClient.post(`/integrations/google-sheets/credentials/${credentialId}/test`, { orgId });
    return GoogleSheetsTestConnectionSchema.parse(data);
  },

  async listSpreadsheets(orgId: string, credentialId: string): Promise<GoogleSpreadsheetInfo[]> {
    const { data } = await apiClient.get("/integrations/google-sheets/spreadsheets", {
      params: { orgId, credentialId },
    });
    return z.array(GoogleSpreadsheetInfoSchema).parse(data);
  },

  async getAccessToken(orgId: string, credentialId: string): Promise<GoogleSheetsAccessTokenResult> {
    const { data } = await apiClient.get("/integrations/google-sheets/access-token", {
      params: { orgId, credentialId },
    });
    return GoogleSheetsAccessTokenSchema.parse(data);
  },

  async listSheets(orgId: string, credentialId: string, spreadsheetId: string): Promise<GoogleSheetInfo[]> {
    const { data } = await apiClient.get("/integrations/google-sheets/sheets", {
      params: { orgId, credentialId, spreadsheetId },
    });
    return z.array(GoogleSheetInfoSchema).parse(data);
  },

  async getColumns(orgId: string, credentialId: string, spreadsheetId: string, sheetId: string): Promise<string[]> {
    const { data } = await apiClient.get("/integrations/google-sheets/columns", {
      params: { orgId, credentialId, spreadsheetId, sheetId },
    });
    return z.array(z.string()).parse(data);
  },

  async getAuthUrl(orgId: string): Promise<string> {
    const { data } = await apiClient.get("/integrations/google-sheets/auth/url", {
      params: { orgId },
    });
    return z.string().parse(data.url);
  },
};
