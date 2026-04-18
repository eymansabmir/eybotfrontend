import { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useHttpRequestCredentials, useHttpRequestPreview } from "@/features/integrations/http-request/hooks/use-http-request-integration";
import { HttpRequestConfigForm } from "@/features/integrations/http-request/presentation/http-request-config-form";
import { HttpRequestCredentialsDialog } from "@/features/integrations/http-request/presentation/http-request-credentials-dialog";
import { createHttpRequestConfigDraft, type HttpRequestConfigDraft, type HttpRequestKeyValuePair } from "@/features/integrations/http-request/state/http-request-config.state";

import type { HttpRequestNodeData } from "./schema";

export function HttpRequestNodeRenderer({ id, data, selected }: NodeProps & { data: HttpRequestNodeData }) {
  const { setNodes } = useReactFlow();
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<HttpRequestConfigDraft>(() => createHttpRequestConfigDraft(data));
  const [testResponseText, setTestResponseText] = useState<string | undefined>(undefined);
  const [responsePathSuggestions, setResponsePathSuggestions] = useState<string[]>([]);

  const credentialsQuery = useHttpRequestCredentials(DEFAULT_ORG_ID);
  const previewMutation = useHttpRequestPreview();

  useEffect(() => {
    if (selected) {
      setDraft(createHttpRequestConfigDraft(data));
      setTestResponseText(undefined);
      setResponsePathSuggestions([]);
    }
  }, [selected, data]);

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
    <div className="relative">
      {/* 1) Condensed Block Face */}
      <div
          className={cn(
              "flex flex-col justify-center relative w-[220px] min-h-[85px] rounded-xl border p-3.5 select-none transition-all cursor-pointer",
              "bg-[var(--node-bg)] border-[var(--border-dim)] hover:shadow-md",
              selected && "border-2 border-[var(--ey-yellow)] shadow-[0_0_10px_rgba(255,230,0,0.15)] -m-[1px]"
          )}
      >
          <Handle
              type="target"
              position={Position.Top}
              className="h-3 w-3 border-2 border-[var(--border-dim)] bg-background shadow-sm hover:scale-125 transition-transform"
          />

          <div className="flex flex-col gap-2.5 w-full">
              <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                      <Zap className="size-4" />
                  </div>
                  <span className="text-sm font-semibold truncate text-foreground leading-none pr-1">HTTP Request</span>
              </div>

              <div className="min-w-0 flex flex-col mt-0.5">
                  <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {isConfigured ? `${data.method} Request` : "Configure..."}
                        </span>
                    </div>
                  
                  {data.url && (
                      <div className="text-[9px] text-muted-foreground tracking-wide mt-1 max-w-full truncate font-mono">
                          {data.url}
                      </div>
                  )}

                  {data.responseMapping && data.responseMapping.length > 0 && (
                      <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                          ➔ @{data.responseMapping[0].variableName}{data.responseMapping.length > 1 ? ', ...' : ''}
                      </div>
                  )}
              </div>
          </div>

          <Handle
              type="source"
              position={Position.Bottom}
              className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
          />
      </div>

      {/* 2) Popover Configuration Panel */}
      {selected && (
          <div 
              className="absolute top-0 left-[230px] w-[380px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
          >
              <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                      <Zap className="size-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure HTTP Request</span>
                  </div>
              </div>
              
              <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar p-4 text-foreground">
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

              <div className="flex justify-end border-t border-[var(--border-dim)] px-4 py-3 bg-muted/10">
                  <Button 
                      onClick={onSaveConfig} 
                      size="sm" 
                      className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
                  >
                      <Save className="size-3.5" />
                      Save Configuration
                  </Button>
              </div>
          </div>
      )}

      {/* Global Credentials Dialog */}
      <HttpRequestCredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential) => {
          setDraft((prev) => ({ ...prev, credentialId: credential.id }));
        }}
      />
    </div>
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
