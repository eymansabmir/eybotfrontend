import type { NodeProps } from "@xyflow/react";
import { Code, Info } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import type { ScriptNodeData } from "./schema";
import { ScriptNodeConfig } from "./config";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ScriptNodeRenderer({ id, data, selected }: NodeProps & { data: ScriptNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<ScriptNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<Code size={16} />}
            title="Script"
            popoverTitle="Configure Script"
            description={ScriptNodeConfig.description}
            summary={data.name ? `${data.name}` : "Custom logic"}
            showPopover={selected}
            popoverContentClassName="p-4 space-y-5 w-[400px]"
            popoverBody={
                <>
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Name</Label>
                        <Input
                            className="w-full bg-background rounded-xl border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.name || ""}
                            placeholder="e.g., Format date"
                            onChange={(e) => updateData({ name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Code</Label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[250px] text-[10px]">
                                            Write JavaScript/TypeScript code. You can update flow variables by setting them on the global variables object. E.g., variables.result = "success";
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                        <Textarea
                            className="w-full bg-muted/20 font-mono text-xs rounded-xl border border-[var(--border-dim)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.content || ""}
                            placeholder="variables.myVar = 'Hello';"
                            rows={10}
                            onChange={(e) => updateData({ content: e.target.value })}
                        />
                    </div>
                </>
            }
        />
    );
}
