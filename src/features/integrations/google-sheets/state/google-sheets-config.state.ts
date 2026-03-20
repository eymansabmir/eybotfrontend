import type { GoogleSheetsActionMode } from "../domain/google-sheets.types";
import type { GoogleSheetsNodeData } from "@/features/nodes/google-sheets/schema";
import type { CellItem } from "../presentation/components/cell-value-stack";

export interface GoogleSheetsConfigDraft {
  action: GoogleSheetsActionMode;
  credentialId: string;
  spreadsheetId: string;
  spreadsheetName?: string;
  sheetId: string;
  rowId?: number;
  valuesItems: CellItem[];
  filterItems: CellItem[];
  timeoutMs?: number;
  responseMappingText: string;
}

type Action =
  | { type: "set"; payload: Partial<GoogleSheetsConfigDraft> }
  | { type: "reset"; payload: GoogleSheetsConfigDraft };

export function googleSheetsConfigReducer(state: GoogleSheetsConfigDraft, action: Action): GoogleSheetsConfigDraft {
  if (action.type === "reset") return action.payload;
  return { ...state, ...action.payload };
}

export function createGoogleSheetsConfigDraft(input: Partial<GoogleSheetsConfigDraft & GoogleSheetsNodeData>): GoogleSheetsConfigDraft {
  const responseMappingArray = Array.isArray(input.responseMapping) ? input.responseMapping : undefined;

  return {
    action: input.action ?? "insert_row",
    credentialId: input.credentialId ?? "",
    spreadsheetId: input.spreadsheetId ?? "",
    spreadsheetName: input.spreadsheetName,
    sheetId: input.sheetId ?? "",
    rowId: input.rowId,
    valuesItems: parseItems(input.values),
    filterItems: parseItems(input.filter),
    timeoutMs: input.timeoutMs,
    responseMappingText: responseMappingArray ? JSON.stringify(responseMappingArray, null, 2) : "[\n  {\n    \"jsonPath\": \"$.success\",\n    \"variableName\": \"inserted\",\n    \"scope\": \"session\"\n  }\n]",
  };
}

function parseItems(str: string | undefined): CellItem[] {
  try {
    if (!str) return [];
    const parsed = JSON.parse(str);
    if (typeof parsed !== "object" || parsed === null) return [];
    
    return Object.entries(parsed).map(([column, value]) => ({
      id: crypto.randomUUID(),
      column,
      value: String(value),
    }));
  } catch {
    return [];
  }
}
