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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRoutingConfig, useEntityTypes } from "../../../api/voice-tech-queries";

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
  const [description, setDescription] = useState("");
  const [entityTypeId, setEntityTypeId] = useState("");
  const [type, setType] = useState<"AUTOMATIC" | "MANUAL">("AUTOMATIC");
  
  const createConfig = useCreateRoutingConfig();
  const { data: entityTypes = [] } = useEntityTypes(tenantId);

  const handleCreate = async () => {
    if (!name.trim() || !entityTypeId) return;
    
    try {
      const config = await createConfig.mutateAsync({
        tenantId,
        name: name.trim(),
        description: description.trim(),
        entityTypeId,
        type,
      });
      
      setName("");
      setDescription("");
      setEntityTypeId("");
      onOpenChange(false);
      onSuccess?.(config.id);
    } catch (e) {
      console.error("Failed to create config", e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto vt-scrollbar">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
             <div className="size-8 rounded-lg bg-primary/10 grid place-items-center text-primary">
                <Settings2 className="size-4" />
             </div>
             <DialogTitle>Create Routing Group</DialogTitle>
          </div>
          <DialogDescription>
             Create a new routing group to manage your voice routing rules. You can switch between groups at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config-name">Group Name</Label>
            <Input 
              id="config-name" 
              placeholder="e.g. Production Flow, Inbound Test" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config-desc">Description (Optional)</Label>
            <Textarea 
              id="config-desc" 
              placeholder="What is this routing group for?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none h-20"
            />
          </div>

          <div className="space-y-2">
            <Label>Dataset</Label>
            <Select value={entityTypeId} onValueChange={setEntityTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dataset to route" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((et) => (
                  <SelectItem key={et.id} value={et.id}>
                    {et.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground pl-1">
              The dataset provides the attributes for the routing rules.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Execution Type</Label>
            <Select value={type} onValueChange={(val: "AUTOMATIC" | "MANUAL") => setType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select execution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(!name.trim() || !entityTypeId) && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground p-2 rounded-lg bg-muted/30">
               <AlertCircle className="size-3" />
                Provide a name and select a dataset to create the group.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            disabled={!name.trim() || !entityTypeId || createConfig.isPending}
            onClick={handleCreate}
            className="gap-2"
          >
            {createConfig.isPending ? "Creating..." : (
               <>
                 <Plus className="size-4" />
                 Create Group
               </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
