import { MediaConditionalNodeConfig, MediaConditionalDefaultData } from "./config";
import { MediaConditionalNodeSchema, type MediaConditionalNodeData } from "./schema";
import { MediaConditionalNodeRenderer } from "./renderer";
import type { NodeDefinition } from "../types";

export const MediaConditionalNode: NodeDefinition<MediaConditionalNodeData> = {
  config: MediaConditionalNodeConfig,
  schema: MediaConditionalNodeSchema,
  renderer: MediaConditionalNodeRenderer,
  handler: async (data) => data,
  defaultData: MediaConditionalDefaultData as MediaConditionalNodeData,
  defaultBranches: [
    { key: "image", label: "Image" },
    { key: "text", label: "Text" },
  ],
};

export * from "./schema";
export * from "./config";
