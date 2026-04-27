import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Shuffle as ShuffleIcon, Plus, Trash2 } from "lucide-react";

import type { RandomSplitNodeData, SplitBranch } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { SortableList } from "@/components/ui/sortable-list";

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
        <NodeFrame
            selected={selected}
            icon={<ShuffleIcon size={16} />}
            title="Random Split"
            popoverTitle="Configure Split"
            summary={`${(data.branches?.length || 0)} branches configured`}
            showPopover={selected}
            showBottomHandle={false}
            popoverBody={
                <>
                    <div className="flex items-center justify-end">
                        <button
                            onClick={addBranch}
                            className="flex items-center gap-1 rounded-md border border-[var(--border-dim)] bg-background px-2 py-1 text-[10px] font-bold text-foreground hover:bg-muted/40 transition-colors"
                        >
                            <Plus size={10} /> Add Branch
                        </button>
                    </div>

                    <div className="h-1.5 w-full rounded-full bg-[var(--border-dim)] overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all", isValid ? "bg-green-500" : "bg-destructive")}
                            style={{ width: `${Math.min(total, 100)}%` }}
                        />
                    </div>

                    <div className="space-y-2">
                        <SortableList
                            items={data.branches ?? []}
                            onReorder={(newBranches: any[]) => updateBranches(newBranches)}
                            keyExtractor={(branch: any) => branch.key}
                            renderItem={(branch: any, i: number) => (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="text"
                                        className="flex-1 bg-background rounded-md border border-[var(--border-dim)] px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={branch.label}
                                        placeholder="Branch name"
                                        onChange={(e) => updateBranch(i, "label", e.target.value)}
                                    />
                                    <div className="flex items-center gap-0.5 rounded-md border border-[var(--border-dim)] bg-background px-2 py-1.5">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            className="w-10 bg-transparent text-xs font-medium focus:outline-none text-right"
                                            value={branch.percentage}
                                            onChange={(e) => updateBranch(i, "percentage", parseFloat(e.target.value) || 0)}
                                        />
                                        <span className="text-[10px] text-muted-foreground">%</span>
                                    </div>
                                    <button
                                        onClick={() => removeBranch(i)}
                                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 px-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        />

                        {(data.branches ?? []).length === 0 && (
                            <div className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border-dim)] py-6 text-xs text-muted-foreground italic bg-muted/10">
                                Click "Add Branch" to create paths
                            </div>
                        )}

                        {!isValid && (data.branches ?? []).length > 0 && (
                            <p className="text-[10px] font-bold text-destructive text-center mt-2">Percentages must sum exactly to 100%</p>
                        )}
                    </div>
                </>
            }
            compactBody={
                <>
                    <div className="ml-auto -mt-1">
                        <span className={cn("text-[10px] font-bold", isValid ? "text-green-500" : "text-destructive")}>{total.toFixed(0)}%</span>
                    </div>
                    {(data.branches ?? []).map((branch) => (
                        <Handle
                            key={branch.key}
                            type="source"
                            position={Position.Right}
                            id={branch.key}
                            className="right-[-14px]! h-3 w-3 border-2 border-background bg-amber-500 shadow-sm hover:scale-125 transition-transform opacity-100"
                        />
                    ))}
                </>
            }
        />
    );
}
