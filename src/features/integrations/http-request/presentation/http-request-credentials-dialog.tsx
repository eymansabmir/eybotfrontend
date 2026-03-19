import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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
  const [headersText, setHeadersText] = useState("{}");
  const [queryParamsText, setQueryParamsText] = useState("{}");
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

    const headers = parseObjectOrToast(headersText, "Headers");
    if (headers === null) return;

    const queryParams = parseObjectOrToast(queryParamsText, "Query params");
    if (queryParams === null) return;

    try {
      const created = await createCredential.mutateAsync({
        name: name.trim(),
        baseUrl: proxyMode ? undefined : clean(baseUrl),
        bearerToken: proxyMode ? undefined : clean(bearerToken),
        headers: proxyMode ? undefined : headers,
        queryParams: proxyMode ? undefined : queryParams,
        proxyUrl: proxyMode ? clean(proxyUrl) : undefined,
      });
      toast.success("HTTP credential created");
      onCreated?.(created);
      setBearerToken("");
      setProxyUrl("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to create HTTP credential");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Add HTTP credential</DialogTitle>
          <DialogDescription>
            Create either a request credential (auth/default headers) or a proxy credential for HTTP Request nodes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Primary API credential" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <Label htmlFor="http-credential-proxy-mode" className="text-sm">Create as proxy credential</Label>
            <Switch id="http-credential-proxy-mode" checked={proxyMode} onCheckedChange={setProxyMode} />
          </div>

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
                  <Label>Bearer token (optional)</Label>
                  <Input
                    type="password"
                    value={bearerToken}
                    onChange={(e) => setBearerToken(e.target.value)}
                    placeholder="token..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Default headers (JSON object)</Label>
                  <Textarea
                    rows={5}
                    value={headersText}
                    onChange={(e) => setHeadersText(e.target.value)}
                    placeholder={'{\n  "x-api-version": "2026-03"\n}'}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Default query params (JSON object)</Label>
                  <Textarea
                    rows={5}
                    value={queryParamsText}
                    onChange={(e) => setQueryParamsText(e.target.value)}
                    placeholder={'{\n  "workspaceId": "abc"\n}'}
                  />
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

function parseObjectOrToast(input: string, label: string): Record<string, string> | undefined | null {
  const text = input.trim();
  if (!text || text === "{}") return undefined;

  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      toast.error(`${label} must be a JSON object`);
      return null;
    }

    const output: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value !== "string") {
        toast.error(`${label} values must be strings`);
        return null;
      }
      output[key] = value;
    }

    return Object.keys(output).length > 0 ? output : undefined;
  } catch {
    toast.error(`${label} must be valid JSON`);
    return null;
  }
}

function clean(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}
