import type { NodeDefinition } from "../types";

import { ElevenLabsNodeConfig } from "./config";
import { ElevenLabsNodeHandler } from "./handler";
import { ElevenLabsNodeRenderer } from "./renderer";
import { ElevenLabsNodeSchema, type ElevenLabsNodeData } from "./schema";

export const elevenLabsNode: NodeDefinition<ElevenLabsNodeData> = {
  config: ElevenLabsNodeConfig,
  schema: ElevenLabsNodeSchema,
  renderer: ElevenLabsNodeRenderer,
  handler: ElevenLabsNodeHandler,
  defaultData: {
    credentialId: "",
    voiceId: "",
    text: "",
    modelId: "",
    outputFormat: "mp3_44100_128",
    resultVariable: "elevenlabs_audio",
    resultScope: "session",
    sendResponseToUser: true,
    fallbackText: "",
  },
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./config";
export * from "./schema";
