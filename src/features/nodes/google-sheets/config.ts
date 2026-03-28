import React from "react";
import { GoogleSheetsLogo } from "./logo";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const GoogleSheetsNodeConfig: NodeConfig = {
  type: NodeType.GOOGLE_SHEETS,
  label: "Google Sheets",
  category: "integration",
  icon: React.createElement(GoogleSheetsLogo, { className: "size-4" }),
  description: "Read, write, or update data in Google Sheets.",
};
