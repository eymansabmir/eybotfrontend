import { useMemo, useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Globe, Plus, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { IntegrationShell } from "@/features/integrations/presentation/integration-shell";
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

  const selectedCredential = useMemo(
    () => credentialsQuery.data?.find((item) => item.id === data.credentialId),
    [credentialsQuery.data, data.credentialId],
  );

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

    let headers: Record<string, string> | undefined;
    let queryParams: Record<string, string> | undefined;
    let responseMapping: Array<{ jsonPath: string; variableName: string; scope: "session" | "contact" }> | undefined;

    try {
      headers = parseStringRecord(draft.headersText, "Headers");
      queryParams = parseStringRecord(draft.queryParamsText, "Query params");
      responseMapping = parseMapping(draft.responseMappingText);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid JSON input");
      return;
    }

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
  };

  return (
    <div
      className={cn(
        "group relative min-w-72.5 rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
        selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm transition-transform hover:scale-125"
      />

      <IntegrationShell
        title="HTTP Request"
        subtitle={data.url ? `${data.method} • ${data.url}` : "Configure outbound API call"}
        icon={<Globe className="size-4" />}
        actions={
          <Button variant="ghost" size="sm" className="h-8 gap-1.5" onClick={openConfig}>
            <Settings2 className="size-3.5" />
            Configure...
          </Button>
        }
        className="border-0 shadow-none"
      >
        <div className="space-y-3">
          {data.credentialId ? (
            <p className="text-xs text-muted-foreground">
              {selectedCredential ? `Credential: ${selectedCredential.name}` : "Credential configured"}
            </p>
          ) : (
            <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => setCredentialsOpen(true)}>
              <Plus className="size-4" />
              Add HTTP credential
            </Button>
          )}
        </div>
      </IntegrationShell>

      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="h-4 w-4 border-2 border-background bg-primary shadow-sm transition-transform hover:scale-125"
      />

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">Configure HTTP Request node</DialogTitle>
            <DialogDescription className="px-6">
              Configure request details, credential references, and variable mappings from response payload.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
            <HttpRequestConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
              onConnectAccount={() => setCredentialsOpen(true)}
            />
          </div>
          <div className="flex justify-end border-t px-6 py-4">
            <Button onClick={onSaveConfig} className="gap-1.5">
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
    </div>
  );
}

function parseStringRecord(text: string, label: string): Record<string, string> | undefined {
  const input = text.trim();
  if (!input || input === "{}") {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error(`${label} must be valid JSON`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object`);
  }

  const output: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== "string") {
      throw new Error(`${label} values must be strings`);
    }
    output[key] = value;
  }

  return Object.keys(output).length > 0 ? output : undefined;
}

function parseMapping(text: string): Array<{ jsonPath: string; variableName: string; scope: "session" | "contact" }> | undefined {
  const input = text.trim();
  if (!input || input === "[]") {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("Response mapping must be valid JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Response mapping must be a JSON array");
  }

  const output = parsed.map((entry) => {
    if (!entry || typeof entry !== "object") {
      throw new Error("Each response mapping entry must be an object");
    }

    const item = entry as Record<string, unknown>;
    const jsonPath = item.jsonPath;
    const variableName = item.variableName;
    const scope = item.scope;

    if (typeof jsonPath !== "string" || !jsonPath.trim()) {
      throw new Error("Each response mapping entry needs jsonPath");
    }
    if (typeof variableName !== "string" || !variableName.trim()) {
      throw new Error("Each response mapping entry needs variableName");
    }
    if (scope !== "session" && scope !== "contact") {
      throw new Error("Each response mapping entry scope must be session or contact");
    }

    return {
      jsonPath,
      variableName,
      scope: scope as "session" | "contact",
    };
  });

  return output.length > 0 ? output : undefined;
}
