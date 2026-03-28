import type { NodeDefinition } from "../types";
import { GoogleSheetsNodeConfig } from "./config";
import { GoogleSheetsNodeSchema, type GoogleSheetsNodeData } from "./schema";
import { GoogleSheetsNodeRenderer } from "./renderer";
import { GoogleSheetsNodeHandler } from "./handler";

export const googleSheetsNode: NodeDefinition<GoogleSheetsNodeData> = {
  config: GoogleSheetsNodeConfig,
  schema: GoogleSheetsNodeSchema,
  renderer: GoogleSheetsNodeRenderer,
  handler: GoogleSheetsNodeHandler,
  defaultData: {
    action: "insert_row",
    credentialId: "",
    spreadsheetId: "",
    sheetId: "",
  },
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./schema";
export * from "./config";
