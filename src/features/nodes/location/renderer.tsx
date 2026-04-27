import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { MapPin as MapPinIcon } from "lucide-react";
import type { LocationNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function LocationNodeRenderer({ id, data, selected }: NodeProps & { data: LocationNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<LocationNodeData>) => {
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
                        <span className="text-sm font-semibold truncate text-foreground leading-none">Location</span>
                    </div>
                    
                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.name || (data.latitude || data.longitude ? `${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)}` : "Configure location...")}
                        </span>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
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
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Location</span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-3 rounded-lg border border-[var(--border-dim)] bg-background p-3">
                            <div className="rounded-md bg-red-500/10 p-2 text-red-500 shrink-0">
                                <MapPinIcon size={16} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-foreground truncate">
                                    {data.name || "Unnamed Point"}
                                </span>
                                <span className="text-[10px] text-muted-foreground truncate">
                                    {data.latitude || data.longitude
                                        ? `${data.latitude}, ${data.longitude}`
                                        : "Coordinates missing"}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.latitude ?? ""}
                                    placeholder="37.4221"
                                    onChange={(e) => updateData({ latitude: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.longitude ?? ""}
                                    placeholder="-122.0841"
                                    onChange={(e) => updateData({ longitude: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Name (Optional)</label>
                            <input
                                type="text"
                                className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.name || ""}
                                placeholder="Googleplex"
                                onChange={(e) => updateData({ name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Address (Optional)</label>
                            <input
                                type="text"
                                className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.address || ""}
                                placeholder="1600 Amphitheatre Pkwy..."
                                onChange={(e) => updateData({ address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
