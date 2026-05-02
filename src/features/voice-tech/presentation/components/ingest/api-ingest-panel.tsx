import { useState } from "react";
import { Code2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIngestRecords } from "../../../api/voice-tech-queries";

interface ApiIngestPanelProps {
  tenantId: string;
  entityType: string;
}

const PLACEHOLDER = JSON.stringify(
  [
    { phone: "+91-9876543210", tier: "gold", region: "Karnataka", language: "kn" },
    { phone: "+91-9123456789", tier: "silver", region: "Maharashtra", language: "mr" },
  ],
  null,
  2
);

export function ApiIngestPanel({ tenantId, entityType }: ApiIngestPanelProps) {
  const [raw, setRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  const ingestMutation = useIngestRecords(tenantId);

  const handleSubmit = async () => {
    setParseError(null);
    let records: Record<string, unknown>[];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Must be a JSON array of objects");
      records = parsed;
    } catch (e) {
      setParseError((e as Error).message);
      return;
    }

    await ingestMutation.mutateAsync({ entityType, records });
    setRaw("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Code2 className="size-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">API Record Ingest</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Paste a JSON array of records. Attribute types will be inferred automatically.
      </p>

      <Textarea
        value={raw}
        onChange={(e) => { setRaw(e.target.value); setParseError(null); }}
        placeholder={PLACEHOLDER}
        className="min-h-[180px] font-mono text-xs resize-none"
        spellCheck={false}
      />

      {parseError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2">
          <AlertCircle className="size-3.5 shrink-0 text-red-500 mt-0.5" />
          <p className="text-xs text-red-600">{parseError}</p>
        </div>
      )}

      <Button
        className="w-full"
        size="sm"
        onClick={handleSubmit}
        disabled={!raw.trim() || ingestMutation.isPending}
      >
        {ingestMutation.isPending ? (
          <><Loader2 className="size-3.5 mr-1.5 animate-spin" /> Ingesting…</>
        ) : (
          "Ingest Records"
        )}
      </Button>
    </div>
  );
}
