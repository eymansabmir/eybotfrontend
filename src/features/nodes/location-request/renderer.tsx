import type { NodeProps } from "@xyflow/react";
import { MapPin as MapPinIcon, MessageSquare, Database } from "lucide-react";
import type { LocationRequestNodeData } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

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
        <NodeFrame
            selected={selected}
            icon={<MapPinIcon size={16} />}
            title="Request Location"
            popoverTitle="Ask for Location"
            summary={data.message || "Click to configure message..."}
            showPopover={selected}
            bottomHandleId="default"
            popoverBody={
                <div className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <MessageSquare size={10} /> Display Message
                        </label>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.message || ""}
                            placeholder="e.g. Please share your location..."
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>

                    <div className="rounded-lg bg-muted/20 border border-[var(--border-dim)] p-3 space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Database size={10} /> Variable Prefix
                        </label>
                        <input
                            type="text"
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.variablePrefix || ""}
                            placeholder="e.g. pickup"
                            onChange={(e) => updateData({ variablePrefix: e.target.value })}
                        />
                        <p className="text-[9px] text-muted-foreground italic px-1">
                            Will store captured data into: {data.variablePrefix || '...'}_lat, {data.variablePrefix || '...'}_lng
                        </p>
                    </div>
                </div>
            }
        />
    );
}
