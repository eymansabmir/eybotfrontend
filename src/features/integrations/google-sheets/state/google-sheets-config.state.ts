import type { GoogleSheetsActionMode } from "../domain/google-sheets.types";
import type { GoogleSheetsNodeData } from "@/features/nodes/google-sheets/schema";
import type { CellItem } from "../presentation/components/cell-value-stack";

import type { ExtractItem } from "../presentation/components/cell-variable-stack";
import type { ComparisonItem } from "../presentation/components/cell-comparison-stack";

export interface GoogleSheetsConfigDraft {
  action: GoogleSheetsActionMode;
  credentialId: string;
  spreadsheetId: string;
  spreadsheetName?: string;
  sheetId: string;
  sheetName?: string;
  rowId?: number;
  valuesItems: CellItem[];
  filterItems: CellItem[];
  comparisonItems: ComparisonItem[];
  totalRowsToExtract: string;
  limit?: number;
  extractItems: ExtractItem[];
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

  const extractItems: ExtractItem[] = responseMappingArray
    ? responseMappingArray
        .filter((m) => m.jsonPath.startsWith("$.rows[0].") || m.jsonPath.startsWith("$.rows[*]."))
        .map((m) => ({
          id: crypto.randomUUID(),
          column: m.jsonPath
            .replace("$.rows[*].values.", "")
            .replace("$.rows[*].", "")
            .replace("$.rows[0].values.", "")
            .replace("$.rows[0].", ""),
          variableName: m.variableName,
        }))
    : [];

  let totalRowsToExtract = "All";
  let limit: number | undefined = undefined;
  let comparisonItems: ComparisonItem[] = [];
 
  if (input.filter && typeof input.filter === "object") {
    if ("totalRowsToExtract" in input.filter) {
      totalRowsToExtract = String((input.filter as any).totalRowsToExtract);
    }
    if ("limit" in input.filter) {
      limit = (input.filter as any).limit ? Number((input.filter as any).limit) : undefined;
    }
    if ("comparisons" in input.filter && Array.isArray((input.filter as any).comparisons)) {
      comparisonItems = (input.filter as any).comparisons.map((c: any) => ({
        id: crypto.randomUUID(),
        column: c.column,
        comparisonOperator: c.comparisonOperator ?? "Equal to",
        value: c.value,
      }));
    } else {
      // Legacy simple filter. Map each entry to an "Equal to" comparison item!
      comparisonItems = Object.entries(input.filter).map(([key, val]) => ({
        id: crypto.randomUUID(),
        column: key,
        comparisonOperator: "Equal to",
        value: String(val ?? ""),
      }));
    }
  }
 
  return {
    action: input.action ?? "insert_row",
    credentialId: input.credentialId ?? "",
    spreadsheetId: input.spreadsheetId ?? "",
    spreadsheetName: input.spreadsheetName,
    sheetId: input.sheetId ?? "",
    sheetName: input.sheetName,
    rowId: input.rowId,
    valuesItems: parseItems(input.values),
    filterItems: parseItems(input.filter),
    comparisonItems,
    totalRowsToExtract,
    limit,
    extractItems,
    timeoutMs: input.timeoutMs,
    responseMappingText: responseMappingArray ? JSON.stringify(responseMappingArray, null, 2) : "[\n  {\n    \"jsonPath\": \"$.success\",\n    \"variableName\": \"inserted\",\n    \"scope\": \"session\"\n  }\n]",
  };
}

function parseItems(input: unknown): CellItem[] {
  try {
    if (!input) return [];

    const parsed = typeof input === "string" ? JSON.parse(input) : input;
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
