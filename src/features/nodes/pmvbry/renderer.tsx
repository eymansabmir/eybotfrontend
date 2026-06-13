import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save, Network, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { VariableSelect } from "@/features/variables/components/variable-select";

import type { PmvbryNodeData } from "./schema";
import { PmvbryNodeConfig } from "./config";

export function PmvbryNodeRenderer({ id, data, selected }: NodeProps & { data: PmvbryNodeData }) {
  const { setNodes } = useReactFlow();
  
  const [mobileNumber, setMobileNumber] = useState(data.mobileNumber || "{{contact.wa_id}}");
  const [statusVariableName, setStatusVariableName] = useState(data.statusVariableName || "PMVStatus");
  const [responseMapping, setResponseMapping] = useState(data.responseMapping || []);

  useEffect(() => {
    if (selected) {
      setMobileNumber(data.mobileNumber || "{{contact.wa_id}}");
      setStatusVariableName(data.statusVariableName || "PMVStatus");
      setResponseMapping(data.responseMapping || []);
    }
  }, [selected, data]);

  const updateNodeData = (newData: Partial<PmvbryNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!mobileNumber.trim()) {
      toast.error("Mobile Number variable is required");
      return;
    }

    try {
      const filteredMapping = responseMapping.filter(m => m.jsonPath.trim() && m.variableName.trim());

      updateNodeData({
        mobileNumber: mobileNumber.trim(),
        statusVariableName: statusVariableName.trim() || "PMVStatus",
        responseMapping: filteredMapping.length > 0 ? filteredMapping : undefined,
      });

      toast.success("PMVBRY node updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid input");
    }
  };

  return (
    <NodeFrame
        selected={selected}
        icon={<Network size={16} />}
        title={PmvbryNodeConfig.label}
        popoverTitle="Configure PMVBRY API"
        description={PmvbryNodeConfig.description}
        summary={mobileNumber ? `Mobile: ${mobileNumber}` : "Configure..."}
        showPopover={selected}
        popoverClassName="w-[420px]"
        compactBody={
            <div className="min-w-0 flex flex-col mt-0.5">
                {responseMapping && responseMapping.length > 0 && (
                    <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                        ➔ @{responseMapping[0].variableName}{responseMapping.length > 1 ? ', ...' : ''}
                    </div>
                )}
            </div>
        }
        popoverBody={
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mobile Number</Label>
                    <Input
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="{{contact.wa_id}}"
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Use variable syntax e.g., {"{{contact.wa_id}}"}</p>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Variable Name</Label>
                    <VariableSelect 
                        value={statusVariableName || "PMVStatus"} 
                        onValueChange={(val: string) => setStatusVariableName(val)} 
                        placeholder="e.g. PMVStatus" 
                    />
                    <p className="text-xs text-muted-foreground">Stores "SUCCESS"/"ERROR", and a "{statusVariableName}Code" variable stores the number (e.g. 200).</p>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response Mappings</Label>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => setResponseMapping([...responseMapping, { jsonPath: "", variableName: "", scope: "session" }])}
                        >
                            <Plus className="size-3 mr-1" /> Add Mapping
                        </Button>
                    </div>
                    
                    <div className="space-y-2">
                        {responseMapping.map((mapping, idx) => (
                            <div key={idx} className="flex gap-2 items-start bg-muted/30 p-2 rounded-md border border-border/50">
                                <div className="flex-1 space-y-2">
                                    <Input
                                        placeholder="Response JSON Path (e.g., doj_epf)"
                                        value={mapping.jsonPath}
                                        onChange={(e) => {
                                            const newMappings = [...responseMapping];
                                            newMappings[idx].jsonPath = e.target.value;
                                            setResponseMapping(newMappings);
                                        }}
                                        className="h-8 text-xs font-mono"
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Variable Name"
                                            value={mapping.variableName}
                                            onChange={(e) => {
                                                const newMappings = [...responseMapping];
                                                newMappings[idx].variableName = e.target.value;
                                                setResponseMapping(newMappings);
                                            }}
                                            className="h-8 text-xs font-mono flex-1"
                                        />
                                        <Select
                                            value={mapping.scope}
                                            onValueChange={(val: "session" | "contact") => {
                                                const newMappings = [...responseMapping];
                                                newMappings[idx].scope = val;
                                                setResponseMapping(newMappings);
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[100px] text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="session">Session</SelectItem>
                                                <SelectItem value="contact">Contact</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                        const newMappings = [...responseMapping];
                                        newMappings.splice(idx, 1);
                                        setResponseMapping(newMappings);
                                    }}
                                >
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </div>
                        ))}
                        {responseMapping.length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-2 bg-muted/20 rounded-md border border-dashed border-border/50">
                                No mappings defined.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        }
        popoverFooter={
            <Button 
                onClick={onSaveConfig} 
                size="sm" 
                className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
            >
                <Save className="size-3.5" />
                Save Configuration
            </Button>
        }
    />
  );
}
