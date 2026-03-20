import React from "react";
import { FileSpreadsheet } from "lucide-react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const GoogleSheetsNodeConfig: NodeConfig = {
  type: NodeType.GOOGLE_SHEETS,
  label: "Google Sheets",
  category: "integration",
  icon: React.createElement(FileSpreadsheet, { size: 16 }),
  description: "Read, write, or update data in Google Sheets.",
};
