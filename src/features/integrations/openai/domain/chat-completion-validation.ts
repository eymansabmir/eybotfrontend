type ChatMessageLike = {
  role?: unknown;
  content?: unknown;
};

export type OpenAIChatCompletionInputLike = {
  messages?: unknown;
};

const ALLOWED_ROLES = new Set(["system", "user", "assistant", "dialogue"]);

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function messageContentHasText(content: unknown): boolean {
  if (hasNonEmptyString(content)) {
    return true;
  }

  if (Array.isArray(content)) {
    return content.some((part) => {
      if (hasNonEmptyString(part)) {
        return true;
      }

      if (part && typeof part === "object") {
        const text = (part as Record<string, unknown>).text;
        return hasNonEmptyString(text);
      }

      return false;
    });
  }

  if (content && typeof content === "object") {
    const text = (content as Record<string, unknown>).text;
    return hasNonEmptyString(text);
  }

  return false;
}

export function hasValidOpenAIChatCompletionInput(input: OpenAIChatCompletionInputLike): boolean {
  if (!Array.isArray(input.messages)) {
    return false;
  }

  return input.messages.some((message) => {
    const messageLike = message as ChatMessageLike;
    const role = typeof messageLike?.role === "string" ? messageLike.role.trim() : "";
    const hasAllowedRole = role.length > 0 && ALLOWED_ROLES.has(role);
    return hasAllowedRole && messageContentHasText(messageLike?.content);
  });
}
