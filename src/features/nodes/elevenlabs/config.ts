import React from "react";
import { AudioWaveform } from "lucide-react";

import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ElevenLabsNodeConfig: NodeConfig = {
  type: NodeType.ELEVENLABS,
  label: "ElevenLabs",
  category: "integration",
  icon: React.createElement(AudioWaveform, { size: 16 }),
  description: "Generate speech audio using ElevenLabs voice models.",
};
