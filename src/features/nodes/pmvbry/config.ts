import React from "react";
import { Network } from "lucide-react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const PmvbryNodeConfig: NodeConfig = {
  type: NodeType.PMVBRY,
  label: "PMVBRY Node",
  category: "integration",
  icon: React.createElement(Network, { className: "size-4" }),
  description: "Fetch and decrypt PMVBRY member details using mobile number.",
};
