import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Variable as VarIcon, Plus, Trash2, ChevronDown } from "lucide-react";
import type { SetVariableNodeData, VariableAssignment } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function SetVariableNodeRenderer({ id, data, selected }: NodeProps & { data: SetVariableNodeData }) {
    const { setNodes } = useReactFlow();

    const updateAssignments = (assignments: VariableAssignment[]) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, assignments } } : node
            )
        );
    };

    const addAssignment = () => {
        updateAssignments([
            ...(data.assignments ?? []),
            { variable: "", value: "", scope: "session" },
        ]);
    };

    const removeAssignment = (i: number) => {
        updateAssignments((data.assignments ?? []).filter((_, j) => j !== i));
    };

    const updateAssignment = (i: number, field: keyof VariableAssignment, value: string) => {
        updateAssignments(
            (data.assignments ?? []).map((a, j) =>
                j === i ? { ...a, [field]: value } : a
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
                            <VarIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-none pr-1 truncate">Set Variable</span>
                    </div>

                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {(data.assignments?.length || 0)} variables configured
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
                            <VarIcon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Variables</span>
                        </div>
                        <button
                            onClick={addAssignment}
                            className="flex items-center gap-1 rounded-md border border-[var(--border-dim)] bg-background px-2 py-1 text-[10px] font-bold text-foreground hover:bg-muted/40 transition-colors"
                        >
                            <Plus size={10} /> Add
                        </button>
                    </div>
                    
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-[1fr_60px_1fr_20px] gap-1.5 px-0.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Variable</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Scope</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Value</span>
                            <span />
                        </div>

                        <div className="space-y-2">
                            {(data.assignments ?? []).map((a, i) => (
                                <div key={i} className="grid grid-cols-[1fr_60px_1fr_20px] gap-1.5 items-center">
                                    <input
                                        type="text"
                                        className="bg-background rounded-md border border-[var(--border-dim)] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] w-full"
                                        value={a.variable}
                                        placeholder="name"
                                        onChange={(e) => updateAssignment(i, "variable", e.target.value)}
                                    />
                                    <div className="relative">
                                        <select
                                            className="w-full appearance-none bg-background rounded-md border border-[var(--border-dim)] pl-2 pr-5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] cursor-pointer"
                                            value={a.scope}
                                            onChange={(e) => updateAssignment(i, "scope", e.target.value)}
                                        >
                                            <option value="session">session</option>
                                            <option value="contact">contact</option>
                                        </select>
                                        <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                                    </div>
                                    <input
                                        type="text"
                                        className="bg-background rounded-md border border-[var(--border-dim)] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] w-full"
                                        value={a.value}
                                        placeholder="{{var}}"
                                        onChange={(e) => updateAssignment(i, "value", e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeAssignment(i)}
                                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 flex items-center justify-center"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}

                            {(data.assignments ?? []).length === 0 && (
                                <div className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border-dim)] py-6 text-xs text-muted-foreground italic bg-muted/10">
                                    Click "Add" to set a variable
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
