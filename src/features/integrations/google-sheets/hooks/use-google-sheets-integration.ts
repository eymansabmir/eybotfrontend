import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { googleSheetsCredentialsApi } from "../api/google-sheets-credentials.api";
import { googleSheetsApi } from "../api/google-sheets.api";
import type { CreateGoogleSheetsCredentialInput } from "../domain/google-sheets.types";

const googleSheetsKeys = {
  all: ["integrations", "google-sheets"] as const,
  credentials: (orgId: string) => [...googleSheetsKeys.all, "credentials", orgId] as const,
  spreadsheets: (orgId: string, credentialId: string) =>
    [...googleSheetsKeys.all, "spreadsheets", orgId, credentialId] as const,
  sheets: (orgId: string, credentialId: string, spreadsheetId: string) =>
    [...googleSheetsKeys.all, "sheets", orgId, credentialId, spreadsheetId] as const,
  columns: (orgId: string, credentialId: string, spreadsheetId: string, sheetId: string) =>
    [...googleSheetsKeys.all, "columns", orgId, credentialId, spreadsheetId, sheetId] as const,
};

export function useGoogleSheetsCredentials(orgId: string) {
  return useQuery({
    queryKey: googleSheetsKeys.credentials(orgId),
    queryFn: () => googleSheetsCredentialsApi.list(orgId),
  });
}

export function useCreateGoogleSheetsCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreateGoogleSheetsCredentialInput, "orgId">) =>
      googleSheetsCredentialsApi.create({ ...input, orgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleSheetsKeys.credentials(orgId) });
    },
  });
}

export function useRevokeGoogleSheetsCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => googleSheetsCredentialsApi.revoke(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleSheetsKeys.credentials(orgId) });
    },
  });
}

export function useTestGoogleSheetsCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentialId: string) => googleSheetsApi.testConnection(orgId, credentialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleSheetsKeys.credentials(orgId) });
    },
  });
}

export function useGoogleSpreadsheets(orgId: string, credentialId?: string) {
  return useQuery({
    queryKey: googleSheetsKeys.spreadsheets(orgId, credentialId ?? ""),
    queryFn: () => googleSheetsApi.listSpreadsheets(orgId, credentialId!),
    enabled: Boolean(credentialId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useGoogleSheets(orgId: string, credentialId?: string, spreadsheetId?: string) {
  return useQuery({
    queryKey: googleSheetsKeys.sheets(orgId, credentialId ?? "", spreadsheetId ?? ""),
    queryFn: () => googleSheetsApi.listSheets(orgId, credentialId!, spreadsheetId!),
    enabled: Boolean(credentialId) && Boolean(spreadsheetId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}

export function useGoogleSheetsColumns(orgId: string, credentialId?: string, spreadsheetId?: string, sheetId?: string) {
  return useQuery({
    queryKey: googleSheetsKeys.columns(orgId, credentialId ?? "", spreadsheetId ?? "", sheetId ?? ""),
    queryFn: () => googleSheetsApi.getColumns(orgId, credentialId!, spreadsheetId!, sheetId!),
    enabled: Boolean(credentialId) && Boolean(spreadsheetId) && Boolean(sheetId),
    retry: (failureCount, error: unknown) => {
      const maybeStatus = (error as { response?: { status?: number } })?.response?.status;
      if (maybeStatus === 401 || maybeStatus === 403 || maybeStatus === 404) return false;
      return failureCount < 1;
    },
  });
}
