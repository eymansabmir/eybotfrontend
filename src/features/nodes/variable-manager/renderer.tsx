import type { NodeProps } from "@xyflow/react";
import { useVariablesStore } from "@/features/variables/store";
import { cn } from "@/lib/utils";
import { Variable, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { VariableManagerNodeData } from "./schema";

export function VariableManagerNodeRenderer({ selected }: NodeProps & { data: VariableManagerNodeData }) {
    const { variables, addVariable, removeVariable } = useVariablesStore();
    const [newVarName, setNewVarName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        const trimmed = newVarName.trim();
        if (trimmed) {
            addVariable(trimmed);
            setNewVarName("");
            setIsAdding(false);
        }
    };

    return (
        <div
            className={cn(
                "group relative w-[320px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-indigo-500/5 px-4 py-3 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
                        <Variable size={16} />
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-foreground/80">
                        Variable Manager
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Global Variables</label>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase"
                    >
                        <Plus size={12} />
                        Add Variable
                    </button>
                </div>

                {isAdding && (
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl border border-border">
                        <input
                            type="text"
                            autoFocus
                            placeholder="new_variable_name"
                            className="flex-1 bg-transparent border-none text-xs focus:outline-none focus:ring-0 text-foreground"
                            value={newVarName}
                            onChange={(e) => setNewVarName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            className="bg-primary/10 text-primary p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="text-muted-foreground p-1.5 hover:text-destructive transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 select-none">
                    {variables.length === 0 && !isAdding ? (
                        <div className="text-center py-6 text-muted-foreground">
                            <Variable className="mx-auto h-8 w-8 opacity-20 mb-2" />
                            <p className="text-xs">No variables defined</p>
                        </div>
                    ) : (
                        variables.map((variable) => (
                            <div
                                key={variable.id}
                                className="group/var flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="text-[10px] font-bold text-primary/40 shrink-0">@</span>
                                    <span className="text-sm font-medium truncate">{variable.name}</span>
                                </div>
                                <button
                                    onClick={() => removeVariable(variable.name)}
                                    className="text-muted-foreground opacity-50 hover:opacity-100 hover:text-destructive transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Note: Deliberately avoiding <Handle> to make it a purely configuration node */}
        </div>
    );
}
