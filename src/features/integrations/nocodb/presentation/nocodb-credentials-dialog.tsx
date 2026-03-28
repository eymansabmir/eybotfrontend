import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateNocoDBCredential } from "../hooks/use-nocodb-integration";
import type { NocoDBCredential } from "../domain/nocodb.types";

interface NocoDBCredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (credential: NocoDBCredential) => void;
}

export function NocoDBCredentialDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: NocoDBCredentialsDialogProps) {
  const createCredential = useCreateNocoDBCredential(orgId);
  const [name, setName] = useState("NocoDB Base");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Credential name is required");
      return;
    }

    if (!baseUrl.trim()) {
      toast.error("Base URL is required");
      return;
    }

    if (!apiKey.trim()) {
      toast.error("API Token is required");
      return;
    }

    try {
      const cleanBaseUrl = baseUrl.trim().replace(/\/$/, "");
      const created = await createCredential.mutateAsync({
        name: name.trim(),
        baseUrl: cleanBaseUrl,
        apiKey: apiKey.trim(),
      });
      toast.success("NocoDB credential created");
      onCreated?.(created);
      setBaseUrl("");
      setApiKey("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to create NocoDB credential");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold tracking-tight">Add NocoDB credential</DialogTitle>
          <DialogDescription>
            Connect to your NocoDB base using the base URL and API token.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production DB" />
          </div>

          <div className="space-y-1.5">
            <Label>Base URL</Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://app.nocodb.com"
            />
            <p className="text-xs text-muted-foreground">Change it only if you are self-hosting NocoDB.</p>
          </div>

          <div className="space-y-1.5">
            <Label>API Token (xc-token)</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your xc-token..."
            />
          </div>
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
