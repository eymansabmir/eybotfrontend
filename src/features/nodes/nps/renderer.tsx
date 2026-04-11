import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { BarChart3, Variable, Settings2, Globe } from "lucide-react";
import type { NpsNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { LockedBadge } from "@/components/ui/locked-badge";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";



export function NpsNodeRenderer({ id, data, selected }: NodeProps & { data: NpsNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes } = useReactFlow();
    const isTranslationMode = !!data.isTranslationMode;

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
        <div
            className={cn(
                "group relative min-w-[300px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
                        <BarChart3 size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        NPS Survey {isTranslationMode && <span className="ml-2 text-primary">(Translation)</span>}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Question Text */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Question</label>
                    <textarea
                        className="w-full min-h-[60px] bg-muted/50 rounded-xl border border-border/50 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                        value={data.message || ""}
                        placeholder="How likely are you to recommend us?"
                        onChange={(e) => updateData({ message: e.target.value })}
                    />
                </div>

                {/* Range Labels */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Left Label</label>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-lg border border-border/50 px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.leftLabel || ""}
                            placeholder="e.g. Not likely"
                            onChange={(e) => updateData({ leftLabel: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Right Label</label>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-lg border border-border/50 px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.rightLabel || ""}
                            placeholder="e.g. Very likely"
                            onChange={(e) => updateData({ rightLabel: e.target.value })}
                        />
                    </div>
                </div>

                {/* Variable Mapping */}
                <div className="space-y-1.5 border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Variable size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Save Score To</label>
                            {isTranslationMode && <LockedBadge />}
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Scope</label>
                            <select
                                className="bg-transparent text-[10px] font-bold text-primary focus:outline-none disabled:opacity-50"
                                value={data.variableScope}
                                onChange={(e) => updateData({ variableScope: e.target.value as any })}
                                disabled={isTranslationMode}
                            >
                                <option value="session">Session</option>
                                <option value="contact">Contact</option>
                            </select>
                        </div>
                    </div>
                    <div className="relative">
                        <VariablesCombobox 
                            value={data.variable || ""} 
                            onChange={(val) => updateData({ variable: val })} 
                            placeholder="e.g. nps_score" 
                            className={isTranslationMode ? "opacity-50 pointer-events-none" : ""}
                        />
                    </div>

                </div>

                {/* Advanced Settings Row */}
                <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Settings2 size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Button</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-lg border border-border/50 px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={data.buttonLabel || "Rate"}
                            onChange={(e) => updateData({ buttonLabel: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Globe size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Max Score</label>
                            {isTranslationMode && <LockedBadge />}
                        </div>
                        <input
                            type="number"
                            min="1"
                            max="11"
                            className="w-full bg-muted/50 rounded-lg border border-border/50 px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                            value={data.length || 11}
                            onChange={(e) => updateData({ length: parseInt(e.target.value) || 11 })}
                            readOnly={isTranslationMode}
                        />
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />

            {/* Visual background element */}
            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-indigo-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
