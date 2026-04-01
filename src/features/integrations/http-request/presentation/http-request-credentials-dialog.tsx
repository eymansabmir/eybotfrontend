import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useCreateHttpRequestCredential } from "../hooks/use-http-request-integration";
import type { HttpRequestCredential } from "../domain/http-request.types";

interface HttpRequestCredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (credential: HttpRequestCredential) => void;
}

export function HttpRequestCredentialsDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: HttpRequestCredentialsDialogProps) {
  const createCredential = useCreateHttpRequestCredential(orgId);
  const [name, setName] = useState("HTTP credential");
  const [baseUrl, setBaseUrl] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [headers, setHeaders] = useState<KeyValueRow[]>([]);
  const [queryParams, setQueryParams] = useState<KeyValueRow[]>([]);
  const [proxyUrl, setProxyUrl] = useState("");
  const [proxyMode, setProxyMode] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Credential name is required");
      return;
    }

    if (proxyMode && !proxyUrl.trim()) {
      toast.error("Proxy URL is required in proxy mode");
      return;
    }

    const normalizedHeaders = toRecord(headers);
    const normalizedQueryParams = toRecord(queryParams);

    try {
      const created = await createCredential.mutateAsync({
        name: name.trim(),
        baseUrl: proxyMode ? undefined : clean(baseUrl),
        bearerToken: proxyMode ? undefined : clean(bearerToken),
        headers: proxyMode ? undefined : normalizedHeaders,
        queryParams: proxyMode ? undefined : normalizedQueryParams,
        proxyUrl: proxyMode ? clean(proxyUrl) : undefined,
      });
      toast.success("HTTP credential created");
      onCreated?.(created);
      setBearerToken("");
      setProxyUrl("");
      setHeaders([]);
      setQueryParams([]);
      onOpenChange(false);
    } catch {
      toast.error("Failed to create HTTP credential");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Connect HTTP account</DialogTitle>
          <DialogDescription>
            Save reusable API settings (base URL, token, headers) or a proxy connection for HTTP Request nodes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="rounded-lg border bg-muted/20 p-3 text-sm text-muted-foreground space-y-1">
            <p>Use this once, then reuse it in any HTTP Request node.</p>
            <p>Works with Zapier webhooks, Make webhooks, Gemini APIs, and most REST APIs.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Connection name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Example: JSONPlaceholder API" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <Label htmlFor="http-credential-proxy-mode" className="text-sm">Create as proxy credential</Label>
            <Switch id="http-credential-proxy-mode" checked={proxyMode} onCheckedChange={setProxyMode} />
          </div>
          <p className="text-xs text-muted-foreground">
            Keep this off for normal API/webhook use. Turn it on only if your network requires routing requests through a proxy server.
          </p>

          {proxyMode ? (
            <div className="space-y-1.5">
              <Label>Proxy URL</Label>
              <Input
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                placeholder="http://user:pass@proxy.example.com:8080"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Base URL (optional)</Label>
                  <Input
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>API token (optional)</Label>
                  <Input
                    type="password"
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="Paste token (Bearer prefix not required)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Default headers (optional)</Label>
                  <div className="space-y-2">
                    {headers.map((row) => (
                      <div key={row.id} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                        <button
                          type="button"
                          className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => setHeaders((prev) => prev.filter((item) => item.id !== row.id))}
                          aria-label="Remove header"
                        >
                          <Trash2 className="size-3" />
                        </button>
                        <div className="pr-6 space-y-2">
                          <Input
                            value={row.key}
                            onChange={(e) => setHeaders((prev) => prev.map((item) => item.id === row.id ? { ...item, key: e.target.value } : item))}
                            placeholder="Header name (e.g. Content-Type)"
                            className="h-8 text-xs bg-background"
                          />
                          <Input
                            value={row.value}
                            onChange={(e) => setHeaders((prev) => prev.map((item) => item.id === row.id ? { ...item, value: e.target.value } : item))}
                            placeholder="Header value (e.g. application/json)"
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={() => setHeaders((prev) => [...prev, createRow()])}>
                      <Plus className="size-3" />
                      Add header
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Default query params (optional)</Label>
                  <div className="space-y-2">
                    {queryParams.map((row) => (
                      <div key={row.id} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                        <button
                          type="button"
                          className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                          onClick={() => setQueryParams((prev) => prev.filter((item) => item.id !== row.id))}
                          aria-label="Remove query param"
                        >
                          <Trash2 className="size-3" />
                        </button>
                        <div className="pr-6 space-y-2">
                          <Input
                            value={row.key}
                            onChange={(e) => setQueryParams((prev) => prev.map((item) => item.id === row.id ? { ...item, key: e.target.value } : item))}
                            placeholder="Param name (e.g. api_key)"
                            className="h-8 text-xs bg-background"
                          />
                          <Input
                            value={row.value}
                            onChange={(e) => setQueryParams((prev) => prev.map((item) => item.id === row.id ? { ...item, value: e.target.value } : item))}
                            placeholder="Param value"
                            className="h-8 text-xs bg-background"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={() => setQueryParams((prev) => [...prev, createRow()])}>
                      <Plus className="size-3" />
                      Add query param
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-3">
          <Button onClick={handleSubmit} disabled={createCredential.isPending} className="min-w-28">
            {createCredential.isPending ? <Loader2 className="size-4 animate-spin" /> : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function clean(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

interface KeyValueRow {
  id: string;
  key: string;
  value: string;
}

function createRow(): KeyValueRow {
  return {
    id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    key: "",
    value: "",
  };
}

function toRecord(rows: KeyValueRow[]): Record<string, string> | undefined {
  const output: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (!key) continue;
    output[key] = row.value;
  }
  return Object.keys(output).length > 0 ? output : undefined;
}
