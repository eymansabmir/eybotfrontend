export function usesMaxCompletionTokensParam(modelId?: string): boolean {
  if (!modelId) return false;
  const id = modelId.toLowerCase();
  return id.startsWith('gpt-5') || id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4');
}

export function isReliableTextModel(modelId: string): boolean {
  const id = modelId.toLowerCase();

  if (
    id.includes('whisper') ||
    id.includes('transcribe') ||
    id.includes('audio') ||
    id.includes('tts') ||
    id.includes('dall-e') ||
    id.includes('gpt-image') ||
    id.includes('embedding') ||
    id.includes('moderation')
  ) {
    return false;
  }

  return id === 'gpt-3.5-turbo' || id.startsWith('gpt-4') || id.startsWith('gpt-5') || id.includes('chatgpt');
}
