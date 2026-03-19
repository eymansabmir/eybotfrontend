import { useState } from "react";
import { CircleHelp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OpenAICredential } from "../domain/openai.types";
import { useCreateOpenAICredential } from "../hooks/use-openai-integration";

interface OpenAICredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (credential: OpenAICredential) => void;
}

export function OpenAICredentialsDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: OpenAICredentialsDialogProps) {
  const createCredential = useCreateOpenAICredential(orgId);
  const [name, setName] = useState("My account");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.openai.com/v1");

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
      toast.success("OpenAI account connected");
      onCreated?.(created);
      setApiKey("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to connect OpenAI account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold tracking-tight">Add OpenAI account</DialogTitle>
          <DialogDescription>
            Add your OpenAI API credential to load models and execute OpenAI nodes.
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
              placeholder="sk-..."
              className="h-12 text-base"
            />
            <p className="text-sm text-muted-foreground">
              You can generate an API key{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                here
              </a>
              .
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Base URL <CircleHelp className="size-3.5 text-muted-foreground" />
            </Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
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
