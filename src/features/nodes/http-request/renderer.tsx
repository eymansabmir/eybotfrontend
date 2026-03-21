import { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useHttpRequestCredentials } from "@/features/integrations/http-request/hooks/use-http-request-integration";
import { HttpRequestConfigForm } from "@/features/integrations/http-request/presentation/http-request-config-form";
import { HttpRequestCredentialsDialog } from "@/features/integrations/http-request/presentation/http-request-credentials-dialog";
import { createHttpRequestConfigDraft, type HttpRequestConfigDraft } from "@/features/integrations/http-request/state/http-request-config.state";

import type { HttpRequestNodeData } from "./schema";

export function HttpRequestNodeRenderer({ id, data, selected }: NodeProps & { data: HttpRequestNodeData }) {
  const { setNodes } = useReactFlow();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<HttpRequestConfigDraft>(() => createHttpRequestConfigDraft(data));

  const credentialsQuery = useHttpRequestCredentials(DEFAULT_ORG_ID);

  const openConfig = () => {
    setDraft(createHttpRequestConfigDraft(data));
    setConfigOpen(true);
  };

  const updateNodeData = (newData: Partial<HttpRequestNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.url.trim()) {
      toast.error("URL is required");
      return;
    }

    try {
      const headers = parseStringRecord(draft.headersText, "Headers");
      const queryParams = parseStringRecord(draft.queryParamsText, "Query params");
      const responseMapping = parseMapping(draft.responseMappingText);

      updateNodeData({
        url: draft.url.trim(),
        method: draft.method,
        headers,
        queryParams,
        body: draft.body.trim() ? draft.body : undefined,
        timeoutMs: draft.timeoutMs,
        responseMapping,
        credentialId: draft.credentialId || undefined,
        proxyCredentialsId: draft.proxyCredentialsId || undefined,
      });

      setConfigOpen(false);
      toast.success("HTTP Request node updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid JSON input");
    }
  };

  const isConfigured = !!data.url;

  return (
    <>
      <div
        onClick={openConfig}
        className={cn(
          "group relative flex min-w-40 max-w-[240px] cursor-pointer rounded-lg border bg-background p-3 transition-all hover:shadow-md",
          selected ? "border-primary ring-1 ring-primary" : "border-border shadow-sm",
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="size-2 border-2 border-background bg-muted-foreground !transition-transform group-hover:scale-125"
        />

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0 rounded bg-amber-100 p-1 dark:bg-amber-900/40">
              <Zap className="size-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={cn(
                "truncate text-sm font-medium",
                isConfigured ? "text-foreground" : "text-muted-foreground"
              )}>
                {isConfigured ? `${data.method} Request` : "Configure..."}
              </p>
              {data.url && (
                <p className="truncate text-[10px] text-muted-foreground font-mono">
                  {data.url}
                </p>
              )}
            </div>
          </div>

          {data.responseMapping && data.responseMapping.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden border-t border-border/40 pt-2">
              <span className="shrink-0 text-[10px] font-medium italic text-muted-foreground text-[8px] tracking-wider">Set</span>
              {data.responseMapping.map((m, i) => (
                <span key={i} className="truncate rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  {m.variableName}
                </span>
              ))}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="size-2 border-2 border-background bg-primary !transition-transform group-hover:scale-125"
        />
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="flex items-center gap-2 text-base">
               <Zap className="size-5 text-amber-500" />
               HTTP Request
            </DialogTitle>
            <DialogDescription className="px-5 text-xs text-muted-foreground">
              Configure request details and response mapping.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <HttpRequestConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
              onConnectAccount={() => setCredentialsOpen(true)}
            />
          </div>
          <div className="flex justify-end border-t border-border/50 px-5 py-3 bg-muted/20">
            <Button onClick={onSaveConfig} size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              <Save className="size-3.5" />
              Save config
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <HttpRequestCredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential) => {
          setDraft((prev) => ({ ...prev, credentialId: credential.id }));
        }}
      />
    </>
  );
}

function parseStringRecord(text: string, label: string): Record<string, string> | undefined {
  const input = text.trim();
  if (!input || input === "{}") return undefined;
  try {
    const parsed = JSON.parse(input);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    const output: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      output[key] = String(value);
    }
    return output;
  } catch {
    throw new Error(`${label} must be a valid JSON object`);
  }
}

function parseMapping(text: string): Array<{ jsonPath: string; variableName: string; scope: "session" | "contact" }> | undefined {
  const input = text.trim();
  if (!input || input === "[]") return undefined;
  try {
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed;
  } catch {
    throw new Error("Response mapping must be a valid JSON array");
  }
}
