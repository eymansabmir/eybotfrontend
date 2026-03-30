export function isValidAssistantThreadIdInput(value: unknown): boolean {
  if (typeof value !== "string") {
    return true;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  const hasTemplateMarkers = trimmed.includes("{{") || trimmed.includes("}}");
  if (!hasTemplateMarkers) {
    return true;
  }

  return /^\{\{\s*(session|contact)\.[a-zA-Z0-9_]+\s*\}\}$/.test(trimmed);
}
