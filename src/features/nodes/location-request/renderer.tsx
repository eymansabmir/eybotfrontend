import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { MapPin as MapPinIcon, MessageSquare, Database } from "lucide-react";
import type { LocationRequestNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";

export function LocationRequestNodeRenderer({ id, data, selected }: NodeProps & { data: LocationRequestNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<LocationRequestNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    return (
        <div
            className={cn(
                "group relative min-w-[280px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            <div className="flex items-center justify-between border-b border-border/50 bg-emerald-500/5 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
                        <MapPinIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Location Request
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare size={12} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Display Message</label>
                    </div>
                    <textarea
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[60px] resize-none"
                        value={data.message || ""}
                        placeholder="e.g. Please share your location to find nearby stores..."
                        onChange={(e) => updateData({ message: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Database size={12} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Variable Prefix</label>
                    </div>
                    <VariablesCombobox 
                        value={data.variablePrefix || ""}
                        onChange={(val) => updateData({ variablePrefix: val })}
                        placeholder="Prefix. e.g. pickup"
                    />
                    <p className="text-[8px] text-muted-foreground italic px-1">
                        Will store: {data.variablePrefix || '...'}_lat, {data.variablePrefix || '...'}_lng, etc.
                    </p>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                id="default"
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />
        </div>
    );
}
