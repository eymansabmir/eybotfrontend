import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Keyboard, Variable, ShieldCheck } from "lucide-react";
import type { InputNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { LockedBadge } from "@/components/ui/locked-badge";

export function InputNodeRenderer({ id, data, selected }: NodeProps & { data: InputNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes } = useReactFlow();
    const isTranslationMode = !!data.isTranslationMode;

    const updateData = (newData: Partial<InputNodeData>) => {
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
                "group relative min-w-[280px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
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
                    <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-500">
                        <Keyboard size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Wait for Reply {isTranslationMode && <span className="ml-2 text-primary">(Translation)</span>}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Question Text */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Question</label>
                    <textarea
                        className="w-full min-h-[60px] bg-muted/50 rounded-xl border border-border/50 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                        value={data.question}
                        placeholder="What would you like to ask?"
                        onChange={(e) => updateData({ question: e.target.value })}
                    />
                </div>

                {/* Variable Mapping */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 border-t border-border/50 pt-3">
                        <Variable size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Save Answer To</label>
                        {isTranslationMode && <LockedBadge />}
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40">@</span>
                        <input
                            type="text"
                            className="w-full bg-primary/5 rounded-lg border border-primary/20 pl-7 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary disabled:opacity-50"
                            value={data.variable}
                            placeholder="e.g. user_age"
                            onChange={(e) => updateData({ variable: e.target.value })}
                            readOnly={isTranslationMode}
                        />
                    </div>
                </div>

                {/* Validation Type */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Validation</label>
                        {isTranslationMode && <LockedBadge />}
                    </div>
                    <select
                        className="w-full bg-muted/50 rounded-lg border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none disabled:opacity-50"
                        value={data.validationType}
                        onChange={(e) => updateData({ validationType: e.target.value as any })}
                        disabled={isTranslationMode}
                    >
                        <option value="text">Any Text</option>
                        <option value="number">Number Only</option>
                        <option value="email">Email Address</option>
                        <option value="phone">Phone Number</option>
                    </select>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />

            {/* Visual background element */}
            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-emerald-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
