import type { NodeProps } from "@xyflow/react";
import { 
    Variable as VarIcon, 
    Plus, 
    Trash2, 
    ChevronDown, 
    Calendar, 
    Code, 
    XCircle,
    Zap,
    Shuffle
} from "lucide-react";
import type { SetVariableNodeData, VariableAssignment } from "./schema";
import { SYSTEM_VARIABLES, OPERATION_TYPES } from "./constants";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { VariableSelect } from "@/features/variables/components/variable-select";

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
            { variable: "", type: "value", value: "", scope: "session" },
        ]);
    };

    const removeAssignment = (i: number) => {
        updateAssignments((data.assignments ?? []).filter((_, j) => j !== i));
    };

    const updateAssignment = (i: number, updates: Partial<VariableAssignment>) => {
        updateAssignments(
            (data.assignments ?? []).map((a: any, j: number) =>
                j === i ? { ...a, ...updates } : a
            )
        );
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<VarIcon size={16} className="text-primary" />}
            title="Set Variable"
            popoverTitle="Variable Assignments"
            summary={`${(data.assignments?.length || 0)} assignments`}
            showPopover={selected}
            popoverClassName="w-[620px]"
            extraPopoverHeader={
                <button
                    onClick={addAssignment}
                    className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
                >
                    <Plus size={12} /> Add Assignment
                </button>
            }
            popoverBody={
                <div className="space-y-6 pb-2">
                    {/* Header Labels - Only show if there are assignments */}
                    {(data.assignments?.length ?? 0) > 0 && (
                        <div className="grid grid-cols-[1fr_24px_1fr_90px_32px] gap-4 px-1 items-center">
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">Variable to set</span>
                            <span />
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">Value / Source</span>
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] text-center">Scope</span>
                            <span />
                        </div>
                    )}

                    <div className="space-y-4">
                        {(data.assignments ?? []).map((a: VariableAssignment, i: number) => (
                            <div key={`assignment-${i}`} className="grid grid-cols-[1fr_24px_1fr_90px_32px] gap-4 items-start flex-1 py-1 group/row animate-in fade-in slide-in-from-top-1 duration-200">
                                {/* Target Variable */}
                                <div className="space-y-1.5">
                                    <VariableSelect
                                        value={a.variable}
                                        onValueChange={(val) => updateAssignment(i, { variable: val })}
                                        placeholder="Select or create..."
                                        className="h-10 border-muted-foreground/20 hover:border-primary/40"
                                    />
                                </div>

                                {/* Connector Icon */}
                                <div className="flex h-10 items-center justify-center text-muted-foreground/30">
                                    <div className="h-[2px] w-4 bg-current rounded-full" />
                                </div>

                                {/* Source Value UI */}
                                <div className="space-y-2">
                                    {/* Operation Type Selector */}
                                    <div className="relative group/op">
                                        <select
                                            className="w-full appearance-none bg-muted/30 rounded-lg border border-transparent pl-8 pr-8 py-2 text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-9 transition-all hover:bg-muted/50"
                                            value={a.type}
                                            onChange={(e) => updateAssignment(i, { type: e.target.value as any, value: "", systemVariable: "" })}
                                        >
                                            {OPERATION_TYPES.map(op => (
                                                <option key={op.value} value={op.value}>{op.label}</option>
                                            ))}
                                        </select>
                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                                            {OPERATION_TYPES.find(op => op.value === a.type)?.icon}
                                        </div>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50 group-hover/op:opacity-100 transition-opacity" />
                                    </div>

                                    {/* Operation-specific Input */}
                                    <div className="animate-in fade-in zoom-in-95 duration-150">
                                        {a.type === "value" && (
                                            <input
                                                type="text"
                                                className="bg-background rounded-lg border border-input px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-full h-10 transition-all hover:border-primary/30"
                                                value={a.value || ""}
                                                placeholder="Enter value..."
                                                onChange={(e) => updateAssignment(i, { value: e.target.value })}
                                            />
                                        )}
                                        {a.type === "variable" && (
                                            <VariableSelect
                                                value={a.value || ""}
                                                onValueChange={(val) => updateAssignment(i, { value: val })}
                                                placeholder="Pick variable..."
                                                className="h-10"
                                            />
                                        )}
                                        {a.type === "system" && (
                                            <div className="relative group/sys">
                                                <select
                                                    className="w-full appearance-none bg-background rounded-lg border border-input pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-10 transition-all hover:border-primary/30"
                                                    value={a.systemVariable || ""}
                                                    onChange={(e) => updateAssignment(i, { systemVariable: e.target.value })}
                                                >
                                                    <option value="">Choose system data...</option>
                                                    {SYSTEM_VARIABLES.map(sv => (
                                                        <option key={sv.value} value={sv.value}>{sv.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/80">
                                                    {SYSTEM_VARIABLES.find(sv => sv.value === a.systemVariable)?.icon || <Zap size={14} />}
                                                </div>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50 group-hover/sys:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                        {a.type === "random_number" && (
                                            <div className="flex items-center gap-2">
                                                <Shuffle size={14} className="text-muted-foreground shrink-0" />
                                                <input
                                                    type="text"
                                                    className="bg-background rounded-lg border border-input px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-full h-10"
                                                    value={a.value || "1-100"}
                                                    placeholder="Min-Max (e.g. 1-100)"
                                                    onChange={(e) => updateAssignment(i, { value: e.target.value })}
                                                />
                                            </div>
                                        )}
                                        {a.type === "random_string" && (
                                            <div className="flex items-center gap-2">
                                                <Shuffle size={14} className="text-muted-foreground shrink-0" />
                                                <input
                                                    type="number"
                                                    className="bg-background rounded-lg border border-input px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-full h-10"
                                                    value={a.value || "8"}
                                                    placeholder="Length..."
                                                    onChange={(e) => updateAssignment(i, { value: e.target.value })}
                                                />
                                            </div>
                                        )}
                                        {a.type === "clear" && (
                                            <div className="h-10 flex items-center gap-2 px-3 text-[11px] text-muted-foreground/80 font-medium border border-dashed border-input rounded-lg bg-muted/5 select-none">
                                                <XCircle size={14} className="text-destructive/50" />
                                                Reset to empty
                                            </div>
                                        )}
                                        {a.type === "date" && (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="bg-background rounded-lg border border-input pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-full h-10"
                                                    value={a.value || ""}
                                                    placeholder="ISO Format (Default)"
                                                    onChange={(e) => updateAssignment(i, { value: e.target.value })}
                                                />
                                                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70" />
                                            </div>
                                        )}
                                        {a.type === "expression" && (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="bg-background rounded-lg border border-input pl-9 pr-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 w-full h-10"
                                                    value={a.value || ""}
                                                    placeholder="e.g. {{price}} * 1.1"
                                                    onChange={(e) => updateAssignment(i, { value: e.target.value })}
                                                />
                                                <Code size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/70" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Scope Toggle */}
                                <div className="relative group/scope">
                                    <select
                                        className="w-full appearance-none bg-muted/20 rounded-lg border border-transparent px-3 py-2 text-[10px] font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-10 transition-all hover:bg-muted/40 text-center"
                                        value={a.scope}
                                        onChange={(e) => updateAssignment(i, { scope: e.target.value as any })}
                                    >
                                        <option value="session">Session</option>
                                        <option value="contact">Contact</option>
                                    </select>
                                    <ChevronDown size={8} className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-30 group-hover/scope:opacity-100 transition-opacity" />
                                </div>

                                {/* Delete Row */}
                                <button
                                    onClick={() => removeAssignment(i)}
                                    className="h-10 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                    title="Remove assignment"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}

                        {(data.assignments ?? []).length === 0 && (
                            <div 
                                onClick={addAssignment}
                                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/10 py-16 text-xs text-muted-foreground/60 hover:bg-primary/[0.02] hover:border-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                    <Plus size={28} />
                                </div>
                                <p className="font-bold text-sm text-foreground/70 group-hover:text-primary transition-colors">Start Automating</p>
                                <p className="text-[11px] opacity-70 mt-1">Add your first variable assignment</p>
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
}
