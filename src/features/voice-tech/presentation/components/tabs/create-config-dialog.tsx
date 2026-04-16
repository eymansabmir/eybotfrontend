import { useState } from "react";
import { 
  Plus, 
  Settings2,
  AlertCircle 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateRoutingConfig } from "../../../api/voice-tech-queries";

interface CreateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  onSuccess?: (configId: string) => void;
}

export function CreateConfigDialog({ 
  open, 
  onOpenChange, 
  tenantId,
  onSuccess 
}: CreateConfigDialogProps) {
  const [name, setName] = useState("");
  const createConfig = useCreateRoutingConfig();

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    try {
      const config = await createConfig.mutateAsync({
        tenantId,
        name: name.trim()
      });
      
      setName("");
      onOpenChange(false);
      onSuccess?.(config.id);
    } catch (e) {
      console.error("Failed to create config", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
             <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                <Settings2 className="size-4" />
             </div>
             <DialogTitle>New Routing Stack</DialogTitle>
          </div>
          <DialogDescription>
            Create a new stack to manage your voice routing rules. You can switch between stacks at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Stack Name</Label>
            <Input 
              id="config-name" 
              placeholder="e.g. Production Flow, Inbound Test" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {!name.trim() && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground p-2 rounded-lg bg-muted/30">
               <AlertCircle className="size-3" />
               A descriptive name helps identify which bot or region this stack serves.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            disabled={!name.trim() || createConfig.isPending}
            onClick={handleCreate}
            className="gap-2"
          >
            {createConfig.isPending ? "Creating..." : (
               <>
                 <Plus className="size-4" />
                 Create Stack
               </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
