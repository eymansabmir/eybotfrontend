import { useState } from "react";
import { CircleHelp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnthropicCredential } from "../domain/anthropic.types";
import { useCreateAnthropicCredential } from "../hooks/use-anthropic-integration";

interface AnthropicCredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (credential: AnthropicCredential) => void;
}

export function AnthropicCredentialsDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: AnthropicCredentialsDialogProps) {
  const createCredential = useCreateAnthropicCredential(orgId);
  const [name, setName] = useState("My account");
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !apiKey.trim()) {
      toast.error("Credential label and API key are required");
      return;
    }

    try {
      const created = await createCredential.mutateAsync({
        name: name.trim(),
        apiKey: apiKey.trim(),
      });
      toast.success("Anthropic account connected");
      onCreated?.(created);
      setApiKey("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to connect Anthropic account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold tracking-tight">Add Anthropic account</DialogTitle>
          <DialogDescription>
            Add your Anthropic API credential to load Claude models and execute Anthropic nodes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Label <CircleHelp className="size-3.5 text-muted-foreground" />
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My account"
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>API key</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground">
              You can generate an API key{" "}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                here
              </a>
              .
            </p>
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
