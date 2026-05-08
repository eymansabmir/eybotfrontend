import { FileSpreadsheet } from "lucide-react";
import React from "react";
import { NodeType } from "../node-types.constants";
import type { NodeConfig } from "../types";

export const MediaConditionalNodeConfig: NodeConfig = {
  type: NodeType.MEDIA_CONDITIONAL,
  label: "Media Condition",
  category: "logic",
  description: "Branch the flow based on the type of media received (image, video, etc.) and save the media URL.",
  icon: React.createElement(FileSpreadsheet, { size: 16 }),
};

export const MediaConditionalDefaultData = {
  message: "Please send the requested media.",
  invalidMessage: "Invalid media type. Please try again.",
  variable: "",
  variableScope: "session",
  timeoutSeconds: 3600,
  maxRetries: 3,
  maxRetriesMessage: "Too many invalid attempts. Please start the bot again.",
  config: [
    { id: "1", type: "image", subTypes: ["jpg", "png"], branchKey: "image" },
    { id: "2", type: "text", subTypes: [], branchKey: "text" },
  ],
};
