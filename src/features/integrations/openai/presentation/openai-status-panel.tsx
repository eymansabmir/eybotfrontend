import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { OpenAICredential, OpenAITestConnectionResult } from "../domain/openai.types";

interface OpenAIStatusPanelProps {
  credential?: OpenAICredential;
  lastTestResult?: OpenAITestConnectionResult | null;
}

export function OpenAIStatusPanel({ credential, lastTestResult }: OpenAIStatusPanelProps) {
  if (!credential) {
    return (
      <div className="rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
        No OpenAI credential selected.
      </div>
    );
  }

  const isRevoked = Boolean(credential.revokedAt) || !credential.isActive;

  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-xs">
        {isRevoked ? (
          <>
            <AlertTriangle className="size-4 text-amber-500" />
            <span className="font-medium text-amber-600">Credential revoked/inactive</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="font-medium text-emerald-600">Credential active</span>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Last successful test: {credential.lastTestedAt ? new Date(credential.lastTestedAt).toLocaleString() : "Never"}
      </p>

      {lastTestResult ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="size-3.5" />
          {lastTestResult.ok ? "Connection test passed" : (lastTestResult.errorMessage ?? "Connection test failed")}
        </div>
      ) : null}
    </div>
  );
}
