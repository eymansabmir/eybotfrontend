import React from "react";
import { ZapLogo } from "./icon";

import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const HttpRequestNodeConfig: NodeConfig = {
  type: NodeType.HTTP_REQUEST,
  label: "HTTP Request",
  category: "integration",
  icon: React.createElement(ZapLogo, { className: "size-4" }),
  description: "Call external HTTP endpoints and map response fields to variables.",
};
