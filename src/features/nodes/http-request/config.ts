import React from "react";
import { Globe } from "lucide-react";

import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const HttpRequestNodeConfig: NodeConfig = {
  type: NodeType.HTTP_REQUEST,
  label: "HTTP Request",
  category: "integration",
  icon: React.createElement(Globe, { size: 16 }),
  description: "Call external HTTP endpoints and map response fields to variables.",
};
