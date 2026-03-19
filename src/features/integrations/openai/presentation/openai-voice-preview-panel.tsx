import { Button } from "@/components/ui/button";

interface OpenAIVoicePreviewPanelProps {
  audioUrl?: string;
  transcript?: string;
  onCopyUrl?: () => void;
  onRegenerate?: () => void;
}

export function OpenAIVoicePreviewPanel({ audioUrl, transcript, onCopyUrl, onRegenerate }: OpenAIVoicePreviewPanelProps) {
  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      {audioUrl ? (
        <>
          <audio controls src={audioUrl} className="w-full" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCopyUrl}>
              Copy URL
            </Button>
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              Re-generate
            </Button>
          </div>
        </>
      ) : null}
      {transcript ? <p className="whitespace-pre-wrap text-sm">{transcript}</p> : null}
    </div>
  );
}
