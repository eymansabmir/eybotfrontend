import type { NodeProps } from "@xyflow/react";
import { Variable as VarIcon, Plus, Trash2, ChevronDown } from "lucide-react";
import type { SetVariableNodeData, VariableAssignment } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { SortableList } from "@/components/ui/sortable-list";

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
        <NodeFrame
            selected={selected}
            icon={<VarIcon size={16} />}
            title="Set Variable"
            popoverTitle="Configure Variables"
            summary={`${(data.assignments?.length || 0)} variables configured`}
            showPopover={selected}
            popoverClassName="w-[340px]"
            extraPopoverHeader={
                <button
                    onClick={addAssignment}
                    className="flex items-center gap-1 rounded-md border border-[var(--border-dim)] bg-background px-2 py-1 text-[10px] font-bold text-foreground hover:bg-muted/40 transition-colors"
                >
                    <Plus size={10} /> Add
                </button>
            }
            popoverBody={
                <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_60px_1fr_20px] gap-1.5 px-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Variable</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Scope</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Value</span>
                        <span />
                    </div>

                    <div className="space-y-2">
                        <SortableList
                            items={data.assignments ?? []}
                            onReorder={(newAssignments: any[]) => updateAssignments(newAssignments)}
                            keyExtractor={(_: any, i: number) => `assignment-${i}`}
                            renderItem={(a: any, i: number) => (
                                <div className="grid grid-cols-[1fr_60px_1fr_20px] gap-1.5 items-center flex-1">
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
                            )}
                        />

                        {(data.assignments ?? []).length === 0 && (
                            <div className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border-dim)] py-6 text-xs text-muted-foreground italic bg-muted/10">
                                Click "Add" to set a variable
                            </div>
                        )}
                    </div>
                </div>
            }
        />
    );
}
