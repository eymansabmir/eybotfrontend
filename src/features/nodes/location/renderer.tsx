import type { NodeProps } from "@xyflow/react";
import { MapPin as MapPinIcon } from "lucide-react";
import type { LocationNodeData } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
        <NodeFrame
            selected={selected}
            icon={<MapPinIcon size={16} />}
            title="Location"
            popoverTitle="Configure Location"
            summary={data.name || (data.latitude || data.longitude ? `${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)}` : "Configure location...")}
            showPopover={selected}
            popoverBody={
                <div className="space-y-4">
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
            }
        />
    );
}
