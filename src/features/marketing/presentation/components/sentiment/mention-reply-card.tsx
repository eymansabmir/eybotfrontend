import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { SentimentLabel, SentimentMention, SentimentReply } from "../../../types";
import { addReplyForMention, getRepliesForMention } from "../../../data/sentiment-replies";
import { cn } from "@/lib/utils";

const sentimentBadge: Record<SentimentLabel, string> = {
  positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  negative: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function MentionReplyCard({ mention }: { mention: SentimentMention }) {
  const [replies, setReplies] = useState<SentimentReply[]>(() => getRepliesForMention(mention.id));
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  const handleSend = () => {
    if (!canSend) return;
    const saved = addReplyForMention(mention.id, draft);
    setReplies((prev) => [...prev, saved]);
    setDraft("");
    setOpen(false);
    toast.success("Reply saved locally — no API yet.");
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{mention.source}</Badge>
          {mention.topic ? <span className="text-xs text-muted-foreground">{mention.topic}</span> : null}
        </div>
        <Badge variant="secondary" className={cn("capitalize", sentimentBadge[mention.sentiment])}>
          {mention.sentiment}
        </Badge>
      </div>
      <p className="text-sm">{mention.snippet}</p>
      <p className="text-xs text-muted-foreground">
        Score: {mention.score.toFixed(2)} · {new Date(mention.timestamp).toLocaleString()}
      </p>

      {replies.length > 0 ? (
        <div className="space-y-2 rounded-md bg-muted/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Replies</p>
          {replies.map((reply) => (
            <div key={reply.id} className="text-sm">
              <p>{reply.text}</p>
              <p className="text-xs text-muted-foreground">
                {reply.author} · {new Date(reply.at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {open ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Write a public reply (saved in this browser only)…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" disabled={!canSend} onClick={handleSend}>Save reply</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          Reply
        </Button>
      )}
    </div>
  );
}
