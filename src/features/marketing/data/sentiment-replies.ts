import type { SentimentReply } from "../types";

const STORAGE_KEY = "eybot.sentiment-replies";

function readAll(): Record<string, SentimentReply[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SentimentReply[]>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, SentimentReply[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getRepliesForMention(mentionId: string): SentimentReply[] {
  return readAll()[mentionId] ?? [];
}

export function addReplyForMention(mentionId: string, text: string): SentimentReply {
  const reply: SentimentReply = {
    id: `reply-${Date.now()}`,
    mentionId,
    text: text.trim(),
    at: new Date().toISOString(),
    author: "You",
  };
  const all = readAll();
  all[mentionId] = [...(all[mentionId] ?? []), reply];
  try {
    writeAll(all);
  } catch {
    // quota / private mode — keep in-memory reply for this session
  }
  return reply;
}
