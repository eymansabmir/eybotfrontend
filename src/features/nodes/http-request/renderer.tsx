import { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useHttpRequestCredentials, useHttpRequestPreview } from "@/features/integrations/http-request/hooks/use-http-request-integration";
import { HttpRequestConfigForm } from "@/features/integrations/http-request/presentation/http-request-config-form";
import { HttpRequestCredentialsDialog } from "@/features/integrations/http-request/presentation/http-request-credentials-dialog";
import { createHttpRequestConfigDraft, type HttpRequestConfigDraft, type HttpRequestKeyValuePair } from "@/features/integrations/http-request/state/http-request-config.state";

import type { HttpRequestNodeData } from "./schema";

export function HttpRequestNodeRenderer({ id, data, selected }: NodeProps & { data: HttpRequestNodeData }) {
  const { setNodes } = useReactFlow();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<HttpRequestConfigDraft>(() => createHttpRequestConfigDraft(data));
  const [testResponseText, setTestResponseText] = useState<string | undefined>(undefined);
  const [responsePathSuggestions, setResponsePathSuggestions] = useState<string[]>([]);

  const credentialsQuery = useHttpRequestCredentials(DEFAULT_ORG_ID);
  const previewMutation = useHttpRequestPreview();

  const openConfig = () => {
    setDraft(createHttpRequestConfigDraft(data));
    setTestResponseText(undefined);
    setResponsePathSuggestions([]);
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
      const headers = toRecord(draft.headers);
      const queryParams = toRecord(draft.queryParams);
      const responseMapping = toResponseMapping(draft.responseMappings);

      updateNodeData({
        url: draft.url.trim(),
        method: draft.method,
        headers,
        queryParams,
        body: draft.body.trim() ? draft.body : undefined,
        timeoutMs: draft.timeoutMs,
        fallbackText: draft.fallbackText.trim() ? draft.fallbackText : undefined,
        responseMapping,
        variablesForTest: draft.variablesForTest.filter((row) => row.variableName.trim().length > 0),
        credentialId: draft.credentialId || undefined,
        proxyCredentialsId: draft.proxyCredentialsId || undefined,
      });

      setConfigOpen(false);
      toast.success("HTTP Request node updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid JSON input");
    }
  };

  const onTestRequest = async () => {
    try {
      const variables = Object.fromEntries(
        draft.variablesForTest
          .map((row) => [row.variableName.trim(), row.value] as const)
          .filter(([key]) => key.length > 0),
      );

      const headers = toRecord(draft.headers, variables);
      const queryParams = toRecord(draft.queryParams, variables);
      const body = draft.body.trim() ? applyTemplateVariables(draft.body, variables) : undefined;

      const result = await previewMutation.mutateAsync({
        orgId: DEFAULT_ORG_ID,
        credentialId: draft.credentialId || undefined,
        proxyCredentialsId: draft.proxyCredentialsId || undefined,
        url: applyTemplateVariables(draft.url.trim(), variables),
        method: draft.method,
        headers,
        queryParams,
        body,
        timeoutMs: draft.timeoutMs,
      });

      setTestResponseText(JSON.stringify(result, null, 2));
      setResponsePathSuggestions(extractJsonPaths(result.data));
      toast.success("Request test completed");
    } catch (error) {
      setTestResponseText(undefined);
      setResponsePathSuggestions([]);
      toast.error(error instanceof Error ? error.message : "Request test failed");
    }
  };

  const isConfigured = !!data.url;

  return (
    <>
      <div
        onClick={openConfig}
        className={cn(
          "group relative flex min-w-40 max-w-60 cursor-pointer rounded-lg border bg-background p-3 transition-all hover:shadow-md",
          selected ? "border-primary ring-1 ring-primary" : "border-border shadow-sm",
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="size-2 border-2 border-background bg-muted-foreground transition-transform! group-hover:scale-125"
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
              <span className="shrink-0 text-[8px] font-medium italic text-muted-foreground tracking-wider">Set</span>
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
          className="size-2 border-2 border-background bg-primary transition-transform! group-hover:scale-125"
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
              onTestRequest={onTestRequest}
              testingRequest={previewMutation.isPending}
              testResponseText={testResponseText}
              responsePathSuggestions={responsePathSuggestions}
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

function toRecord(rows: HttpRequestKeyValuePair[], testVariables?: Record<string, string>): Record<string, string> | undefined {
  const output: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    output[key] = applyTemplateVariables(row.value, testVariables);
  }
  return Object.keys(output).length > 0 ? output : undefined;
}

function toResponseMapping(
  rows: Array<{ jsonPath: string; variableName: string; scope: "session" | "contact" }>,
): Array<{ jsonPath: string; variableName: string; scope: "session" | "contact" }> | undefined {
  const output = rows
    .map((row) => ({
      jsonPath: row.jsonPath.trim(),
      variableName: row.variableName.trim(),
      scope: row.scope,
    }))
    .filter((row) => row.jsonPath && row.variableName);

  return output.length > 0 ? output : undefined;
}

function applyTemplateVariables(template: string, variables?: Record<string, string>): string {
  if (!variables) return template;

  return template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (match, path: string) => {
    const key = String(path).trim();
    if (!key) return match;
    if (variables[key] !== undefined) return variables[key] ?? "";

    const bare = key.replace(/^session\./, "").replace(/^contact\./, "");
    if (variables[bare] !== undefined) return variables[bare] ?? "";

    return match;
  });
}

function extractJsonPaths(payload: unknown): string[] {
  const paths: string[] = [];
  const walk = (value: unknown, path: string) => {
    paths.push(path);
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${index}]`));
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        walk(child, `${path}.${key}`);
      }
    }
  };

  walk(payload, "$");
  return Array.from(new Set(paths)).slice(0, 200);
}
