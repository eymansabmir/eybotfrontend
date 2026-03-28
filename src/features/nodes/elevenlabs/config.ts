import React from "react";

import { ElevenLabsLogo } from "./logo";
import type { NodeConfig } from "../types";
import { NodeType } from "../node-types.constants";

export const ElevenLabsNodeConfig: NodeConfig = {
  type: NodeType.ELEVENLABS,
  label: "ElevenLabs",
  category: "integration",
  icon: React.createElement(ElevenLabsLogo, { width: 16, height: 16 }),
  description: "Generate speech audio using ElevenLabs voice models.",
};

