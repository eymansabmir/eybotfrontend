import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Shuffle as ShuffleIcon, Plus, Trash2 } from "lucide-react";
import type { RandomSplitNodeData, SplitBranch } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function RandomSplitNodeRenderer({ id, data, selected }: NodeProps & { data: RandomSplitNodeData }) {
    const { setNodes } = useReactFlow();

    const total = (data.branches ?? []).reduce((sum, b) => sum + b.percentage, 0);

    const updateBranches = (branches: SplitBranch[]) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id !== id) return node;
                const updatedNode = { ...node, data: { ...node.data, branches } };
                (updatedNode as any).branches = branches.map((b) => ({ key: b.key, label: b.label }));
                return updatedNode;
            })
        );
    };

    const addBranch = () => {
        const key = `branch_${Date.now()}`;
        updateBranches([...(data.branches ?? []), { key, label: `Branch ${(data.branches ?? []).length + 1}`, percentage: 0 }]);
    };

    const removeBranch = (i: number) => {
        updateBranches((data.branches ?? []).filter((_, j) => j !== i));
    };

    const updateBranch = (i: number, field: keyof SplitBranch, value: string | number) => {
        updateBranches(
            (data.branches ?? []).map((b, j) =>
                j === i ? { ...b, [field]: value } : b
            )
        );
    };

    const isValid = Math.abs(total - 100) < 0.01;

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

            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-500">
                        <ShuffleIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Random Split
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn("text-[9px] font-bold", isValid ? "text-green-600" : "text-red-500")}>
                        {total.toFixed(0)}%
                    </span>
                    <button
                        onClick={addBranch}
                        className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-600 hover:bg-amber-500/20 transition-colors"
                    >
                        <Plus size={9} /> Branch
                    </button>
                </div>
            </div>

            <div className="p-3 space-y-2">
                {/* Total bar */}
                <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all", isValid ? "bg-green-500" : "bg-red-400")}
                        style={{ width: `${Math.min(total, 100)}%` }}
                    />
                </div>

                {(data.branches ?? []).map((branch, i) => (
                    <div key={branch.key} className="relative flex items-center gap-2 pr-10">
                        <input
                            type="text"
                            className="flex-1 bg-muted/50 rounded-lg border border-border/50 px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                            value={branch.label}
                            placeholder="Branch name"
                            onChange={(e) => updateBranch(i, "label", e.target.value)}
                        />
                        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/50 px-2 py-1.5">
                            <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-10 bg-transparent text-[10px] font-medium focus:outline-none text-right"
                                value={branch.percentage}
                                onChange={(e) => updateBranch(i, "percentage", parseFloat(e.target.value) || 0)}
                            />
                            <span className="text-[10px] text-muted-foreground">%</span>
                        </div>
                        <button
                            onClick={() => removeBranch(i)}
                            className="absolute right-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <Trash2 size={11} />
                        </button>
                        {/* Per-branch handle */}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={branch.key}
                            className="right-[-28px]! h-4 w-4 border-2 border-background bg-amber-500 shadow-sm hover:scale-125 transition-transform"
                        />
                    </div>
                ))}

                {(data.branches ?? []).length === 0 && (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-border/50 py-4 text-[10px] text-muted-foreground italic">
                        Click "+ Branch" to add paths
                    </div>
                )}

                {!isValid && (data.branches ?? []).length > 0 && (
                    <p className="text-[9px] text-red-500 text-center">Percentages must total 100%</p>
                )}
            </div>

            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-amber-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
