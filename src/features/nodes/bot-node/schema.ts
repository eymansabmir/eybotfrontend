import { z } from "zod";
import { NodeType } from "../node-types.constants";

export const BotNodeSchema = z.object({
  type: z.literal(NodeType.BOT_NODE),
  label: z.string().optional(),
  targetFlowId: z.string().min(1, "Target flow is required"),
  targetNodeId: z.string().optional(),
  inputMappings: z.array(z.object({
    parentKey: z.string(),
    childKey: z.string(),
  })).optional(),
  outputMappings: z.array(z.object({
    parentKey: z.string(),
    childKey: z.string(),
  })).optional(),
});

export type BotNodeData = z.infer<typeof BotNodeSchema>;
