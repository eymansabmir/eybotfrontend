export interface DeepSeekConfigDraft {
  mode: "" | "chat_completion" | "generate_variables";
  credentialId: string;
  model: string;
  prompt: string;
  messages?: { role: string; content?: string; dialogueVariableId?: string; startsBy?: "user" | "assistant" }[];
  systemPrompt: string;
  resultVariable: string;
  resultScope: "session" | "contact";
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  sendResponseToUser: boolean;
  fallbackText: string;
  // Generate Variables mode
  variablesToExtract?: { name: string; description?: string; type?: "string" | "number" | "boolean" }[];
}

type Action =
  | { type: "set"; payload: Partial<DeepSeekConfigDraft> }
  | { type: "reset"; payload: DeepSeekConfigDraft };

export function deepSeekConfigReducer(state: DeepSeekConfigDraft, action: Action): DeepSeekConfigDraft {
  if (action.type === "reset") return action.payload;
  return { ...state, ...action.payload };
}

export function createDeepSeekConfigDraft(input: Partial<DeepSeekConfigDraft>): DeepSeekConfigDraft {
  const mode = input.mode ?? "";

  return {
    mode,
    credentialId: input.credentialId ?? "",
    model: input.model ?? "",
    prompt: input.prompt ?? "",
    messages: input.messages,
    systemPrompt: input.systemPrompt ?? "",
    resultVariable: input.resultVariable ?? "",
    resultScope: input.resultScope ?? "session",
    temperature: input.temperature,
    maxTokens: input.maxTokens,
    timeoutMs: input.timeoutMs,
    sendResponseToUser: input.sendResponseToUser ?? false,
    fallbackText: input.fallbackText ?? "",
    variablesToExtract: input.variablesToExtract,
  };
}
