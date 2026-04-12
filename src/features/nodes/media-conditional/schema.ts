import { z } from "zod";
import { NodeType } from "../node-types.constants";

export const MediaConditionalEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["text", "image", "video", "audio", "document", "location"]),
  subTypes: z.array(z.string()).default([]),
  branchKey: z.string(),
});

export const MediaConditionalNodeSchema = z.object({
  message: z.string().default("Please send the requested media."),
  invalidMessage: z.string().default("Invalid media type. Please try again."),
  variable: z.string().optional(),
  variableScope: z.enum(["session", "contact"]).default("session"),
  timeoutSeconds: z.number().default(3600),
  maxRetries: z.number().optional().default(3),
  maxRetriesMessage: z.string().optional().default("Too many invalid attempts. Please start the bot again."),
  config: z.array(MediaConditionalEntrySchema).default([]),
});

export type MediaConditionalEntry = z.infer<typeof MediaConditionalEntrySchema>;
export type MediaConditionalNodeData = z.infer<typeof MediaConditionalNodeSchema>;
