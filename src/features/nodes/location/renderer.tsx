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
        <div
            className={cn(
                "group relative min-w-[260px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-red-500/10 p-1.5 text-red-500">
                        <MapPinIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Location Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Map preview placeholder */}
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-3">
                    <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                        <MapPinIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground/80">
                            {data.name || "Unnamed location"}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                            {data.latitude !== 0 || data.longitude !== 0
                                ? `${data.latitude.toFixed(5)}, ${data.longitude.toFixed(5)}`
                                : "No coordinates set"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.latitude ?? ""}
                            placeholder="37.4221"
                            onChange={(e) => updateData({ latitude: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Longitude</label>
                        <input
                            type="number"
                            step="any"
                            className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.longitude ?? ""}
                            placeholder="-122.0841"
                            onChange={(e) => updateData({ longitude: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Name (optional)</label>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.name || ""}
                        placeholder="Googleplex"
                        onChange={(e) => updateData({ name: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Address (optional)</label>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.address || ""}
                        placeholder="1600 Amphitheatre Pkwy, Mountain View"
                        onChange={(e) => updateData({ address: e.target.value })}
                    />
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />
        </div>
    );
}
