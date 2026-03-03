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

            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-violet-500/10 p-1.5 text-violet-500">
                        <VarIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Set Variable
                    </span>
                </div>
                <button
                    onClick={addAssignment}
                    className="flex items-center gap-1 rounded-lg bg-violet-500/10 px-2 py-1 text-[9px] font-bold text-violet-600 hover:bg-violet-500/20 transition-colors"
                >
                    <Plus size={9} /> Add
                </button>
            </div>

            <div className="p-3 space-y-2">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_60px_1fr_16px] gap-1.5 px-0.5">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Variable</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Scope</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Value</span>
                    <span />
                </div>

                {(data.assignments ?? []).map((a, i) => (
                    <div key={i} className="grid grid-cols-[1fr_60px_1fr_16px] gap-1.5 items-center">
                        <input
                            type="text"
                            className="bg-muted/50 rounded-lg border border-border/50 px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 w-full"
                            value={a.variable}
                            placeholder="name"
                            onChange={(e) => updateAssignment(i, "variable", e.target.value)}
                        />
                        <div className="relative">
                            <select
                                className="w-full appearance-none bg-muted/50 rounded-lg border border-border/50 pl-2 pr-5 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                                value={a.scope}
                                onChange={(e) => updateAssignment(i, "scope", e.target.value)}
                            >
                                <option value="session">session</option>
                                <option value="contact">contact</option>
                            </select>
                            <ChevronDown size={8} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            className="bg-muted/50 rounded-lg border border-border/50 px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 w-full"
                            value={a.value}
                            placeholder="{{value}} or text"
                            onChange={(e) => updateAssignment(i, "value", e.target.value)}
                        />
                        <button
                            onClick={() => removeAssignment(i)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <Trash2 size={11} />
                        </button>
                    </div>
                ))}

                {(data.assignments ?? []).length === 0 && (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-border/50 py-4 text-[10px] text-muted-foreground italic">
                        Click "+ Add" to set a variable
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />

            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-violet-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
