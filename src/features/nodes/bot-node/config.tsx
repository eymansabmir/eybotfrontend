import { NodeType } from "../node-types.constants";
import { BotLogo } from "./logo";
import type { NodeConfig } from "../types";

export const botNodeConfig: NodeConfig = {
  type: NodeType.BOT_NODE,
  label: "Bot Node",
  icon: <BotLogo size={16} />,
  category: "logic",
  description: "Jump to another bot flow",
};
