import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { ElevenLabsCredential } from "../domain/elevenlabs.types";
import { useCreateElevenLabsCredential } from "../hooks/use-elevenlabs-integration";

interface ElevenLabsCredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (credential: ElevenLabsCredential) => void;
}

export function ElevenLabsCredentialsDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: ElevenLabsCredentialsDialogProps) {
  const createCredential = useCreateElevenLabsCredential(orgId);
  const [name, setName] = useState("My ElevenLabs account");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.elevenlabs.io/v1");

  const handleSubmit = async () => {
    if (!name.trim() || !apiKey.trim()) {
      toast.error("Credential label and API key are required");
      return;
    }

    try {
      const created = await createCredential.mutateAsync({
        name: name.trim(),
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || undefined,
      });
      toast.success("ElevenLabs account connected");
      onCreated?.(created);
      setApiKey("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to connect ElevenLabs account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold tracking-tight">Add ElevenLabs account</DialogTitle>
          <DialogDescription>
            Add your ElevenLabs API credential to load voices and generate speech in flow runtime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My ElevenLabs account"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>API key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="xi-api-key..."
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground">
              Create an API key from the ElevenLabs dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.elevenlabs.io/v1"
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={createCredential.isPending}
            className="h-12 min-w-28"
          >
            {createCredential.isPending ? <Loader2 className="size-4 animate-spin" /> : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
