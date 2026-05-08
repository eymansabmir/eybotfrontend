import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { BarChartHorizontal, Variable as VarIcon, Settings2, Type } from "lucide-react";
import { npsNode } from "./index";

import type { NpsNodeData } from "./schema";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { VariableSelect } from "@/features/variables/components/variable-select";

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

    const summaryText = data.message 
        ? `${data.message} (${data.startsAt ?? 1} to ${data.length ?? 10})` 
        : `Rating from ${data.startsAt ?? 1} to ${data.length ?? 10}`;

    return (
        <NodeFrame
            selected={selected}
            icon={<BarChartHorizontal size={16} />}
            title="Rating / NPS"
            popoverTitle="Configure Rating"
            description={npsNode.config.description}
            summary={summaryText}
            showPopover={selected}
            popoverContentClassName="p-4 space-y-6"
            popoverBody={
                <>
                    {/* Question Text */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight flex items-center gap-1">
                                <Type size={10} /> Question
                            </label>
                            <NodeFrame.Tooltip>
                                The rating question that will be sent to the user.
                            </NodeFrame.Tooltip>
                        </div>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-xl border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.message || ""}
                            maxLength={1024}
                            placeholder="How likely are you to recommend us?"
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>

                    {/* Range Settings */}
                    <div className="space-y-3 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                            <Settings2 size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Range Configuration</label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground font-medium">Starts At</label>
                                <input
                                    type="number"
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                                    value={data.startsAt ?? 1}
                                    onChange={(e) => updateData({ startsAt: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] text-muted-foreground font-medium">Maximum (Max 10)</label>
                                <select
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] appearance-none cursor-pointer"
                                    value={data.length ?? 10}
                                    onChange={(e) => updateData({ length: parseInt(e.target.value) || 10 })}
                                >
                                    {[3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Score variable storage */}
                    <div className="rounded-xl bg-muted/20 border border-[var(--border-dim)] p-4 space-y-2.5 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                            <VarIcon size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Save Answer To</label>
                        </div>
                        <VariableSelect
                            value={data.variable || ""}
                            onValueChange={(val) => updateData({ variable: val })}
                            placeholder="Select variable for score..."
                        />
                    </div>
                </>
            }
        />
    );
}
