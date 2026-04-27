import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { BarChartHorizontal } from "lucide-react";

import type { NpsNodeData } from "./schema";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

export function NpsNodeRenderer({ id, data, selected }: NodeProps & { data: NpsNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<NpsNodeData>) => {
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
            icon={<BarChartHorizontal size={16} />}
            title="NPS Survey"
            popoverTitle="Configure NPS"
            summary={data.message ? data.message : "Click to configure NPS question..."}
            showPopover={selected}
            popoverBody={
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Question</label>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                            value={data.message || ""}
                            placeholder="How likely are you to recommend us?"
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Left Label</label>
                        <input
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                            value={data.leftLabel || ""}
                            placeholder="Not likely"
                            onChange={(e) => updateData({ leftLabel: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Right Label</label>
                        <input
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                            value={data.rightLabel || ""}
                            placeholder="Very likely"
                            onChange={(e) => updateData({ rightLabel: e.target.value })}
                        />
                    </div>
                </div>
            }
        />
    );
}
