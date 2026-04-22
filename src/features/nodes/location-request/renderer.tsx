import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { MapPin as MapPinIcon, MessageSquare, Database } from "lucide-react";
import type { LocationRequestNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

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
        <div className="relative">
            {/* 1) Condensed Block Face */}
            <div
                className={cn(
                    "flex flex-col justify-center relative w-[220px] min-h-[85px] rounded-xl border p-3.5 select-none transition-all cursor-pointer",
                    "bg-[var(--node-bg)] border-[var(--border-dim)] hover:shadow-md",
                    selected && "border-2 border-[var(--ey-yellow)] shadow-[0_0_10px_rgba(255,230,0,0.15)] -m-[1px]"
                )}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className="h-3 w-3 border-2 border-[var(--border-dim)] bg-background shadow-sm hover:scale-125 transition-transform"
                />

                <div className="flex flex-col gap-2.5 w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                            <MapPinIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-none pr-1">Request Location</span>
                    </div>
                    
                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.message || "Click to configure message..."}
                        </span>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="default"
                    className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                />
            </div>

            {/* 2) Popover Configuration Panel */}
            {selected && (
                <div 
                    className="absolute top-0 left-[230px] w-[340px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <MapPinIcon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ask for Location</span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-5">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                <MessageSquare size={10} /> Display Message
                            </label>
                            <textarea
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all min-h-[80px] resize-y"
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
                </div>
            )}
        </div>
    );
}
