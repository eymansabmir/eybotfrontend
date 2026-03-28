import { useState } from "react";
import { CircleHelp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeepSeekCredential } from "../domain/deepseek.types";
import { useCreateDeepSeekCredential } from "../hooks/use-deepseek-integration";

interface DeepSeekCredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (credential: DeepSeekCredential) => void;
}

export function DeepSeekCredentialsDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: DeepSeekCredentialsDialogProps) {
  const createCredential = useCreateDeepSeekCredential(orgId);
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
      toast.success("DeepSeek account connected");
      onCreated?.(created);
      setApiKey("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to connect DeepSeek account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold tracking-tight">Add DeepSeek account</DialogTitle>
          <DialogDescription>
            Add your DeepSeek API credential to load DeepSeek models and execute DeepSeek nodes.
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
                href="https://platform.deepseek.com/api_keys"
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
