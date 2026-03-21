import React from "react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";
import { NocodbLogo } from "./icon";

export const nocodbConfig: NodeConfig = {
  type: NodeType.NOCODB,
  label: "NocoDB",
  category: "integration",
  icon: React.createElement(NocodbLogo, { className: "size-4" }),
  description: "Connect and interact with your NocoDB bases.",
};
