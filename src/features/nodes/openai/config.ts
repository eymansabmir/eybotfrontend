import React from "react";
import { Bot } from "lucide-react";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const OpenAINodeConfig: NodeConfig = {
  type: NodeType.OPENAI,
  label: "OpenAI",
  category: "integration",
  icon: React.createElement(Bot, { size: 16 }),
  description: "Generate AI responses using OpenAI credentials and models.",
};
