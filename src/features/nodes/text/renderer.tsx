import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { MessageSquare, Plus, X } from "lucide-react";
import type { TextNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { LockedBadge } from "@/components/ui/locked-badge";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";

export function TextNodeRenderer({ id, data, selected }: NodeProps & { data: TextNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes } = useReactFlow();
    const [newVar, setNewVar] = useState("");
    const isTranslationMode = !!data.isTranslationMode;

    const updateData = (newData: Partial<TextNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    };

    const addVariable = (newVarName: string) => {
        if (newVarName.trim()) {
            const currentVars = data.variables || [];
            if (!currentVars.includes(newVarName.trim())) {
                updateData({ variables: [...currentVars, newVarName.trim()] });
            }
        }
    };

    const removeVariable = (varName: string) => {
        updateData({
            variables: (data.variables || []).filter(v => v !== varName)
        });
    };

    return (
        <div
            className={cn(
                "group relative min-w-[260px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
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
                    <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                        <MessageSquare size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Text Message {isTranslationMode && <span className="ml-2 text-primary">(Translation)</span>}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Message Input */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Content</label>
                    <textarea
                        className="w-full min-h-[80px] bg-muted/50 rounded-xl border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:italic"
                        value={data.message}
                        placeholder="Type your message here..."
                        onChange={(e) => updateData({ message: e.target.value })}
                    />
                </div>

                {/* Variables Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Variables</label>
                        {isTranslationMode && <LockedBadge />}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {(data.variables || []).map((v) => (
                            <span key={v} className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/5 border border-primary/20 text-[10px] font-medium text-primary group/var">
                                {v}
                                {!isTranslationMode && (
                                    <button
                                        onClick={() => removeVariable(v)}
                                        className="hover:text-destructive transition-colors"
                                    >
                                        <X size={10} />
                                    </button>
                                )}
                            </span>
                        ))}

                        {!isTranslationMode && (
                            <div className="flex items-center gap-1 bg-muted/50 rounded-md px-2 py-1 border border-dashed border-border group/add">
                                <input
                                    type="text"
                                    placeholder="new_var"
                                    className="bg-transparent text-[10px] outline-none w-14 placeholder:text-muted-foreground/50"
                                    value={newVar}
                                    onChange={(e) => setNewVar(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addVariable()}
                                />
                                <button
                                    onClick={addVariable}
                                    className="text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Plus size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />

            {/* Visual background element */}
            <div className="absolute inset-x-0 -bottom-px h-[2px] scale-x-0 bg-primary transition-transform group-hover:scale-x-100 rounded-b-2xl" />
        </div>
    );
}
