import type { NodeProps } from "@xyflow/react";
import { MessageSquare, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

import type { TextNodeData } from "./schema";
import { LockedBadge } from "@/components/ui/locked-badge";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

export function TextNodeRenderer({ id, data, selected }: NodeProps & { data: TextNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes } = useReactFlow();
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
        if (!newVarName.trim()) return;
        const currentVars = data.variables || [];
        if (!currentVars.includes(newVarName.trim())) {
            updateData({ variables: [...currentVars, newVarName.trim()] });
        }
    };

    const removeVariable = (varName: string) => {
        updateData({
            variables: (data.variables || []).filter((v) => v !== varName),
        });
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<MessageSquare size={16} />}
            title="Text Message"
            popoverTitle="Configure Text"
            summary={data.message ? data.message : "Click to configure message..."}
            showPopover={selected}
            popoverContentClassName="p-4 space-y-5"
            popoverBody={
                <>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Content</label>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-xl border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all placeholder:italic"
                            value={data.message}
                            placeholder="Type your message here..."
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Variables</label>
                            {isTranslationMode && <LockedBadge />}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {(data.variables || []).map((v) => (
                                <span key={v} className="flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--ey-yellow)]/20 border border-[var(--ey-yellow)]/40 text-[10px] font-medium text-foreground group/var">
                                    {v}
                                    {!isTranslationMode && (
                                        <button
                                            onClick={() => removeVariable(v)}
                                            className="hover:text-destructive opacity-70 hover:opacity-100 transition-all"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </span>
                            ))}

                            {!isTranslationMode && (
                                <div className="w-full">
                                    <VariableSelect
                                        value=""
                                        onValueChange={(val: string) => addVariable(val)}
                                        placeholder="Add variable..."
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </>
            }
        />
    );
}
