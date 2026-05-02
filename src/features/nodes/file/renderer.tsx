import type { NodeProps } from "@xyflow/react";
import { FileUp, Variable as VarIcon } from "lucide-react";
import type { FileNodeData } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { VariableSelect } from "@/features/variables/components/variable-select";

export function FileNodeRenderer({ id, data, selected }: NodeProps & { data: FileNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<FileNodeData>) => {
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
        <NodeFrame
            selected={selected}
            icon={<FileUp size={16} />}
            title="Wait for File"
            popoverTitle="Configure Wait for File"
            summary={data.message || "Enter prompt message..."}
            showPopover={selected}
            compactBody={
                <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    ➔ @{data.variableName || "variable"}
                </div>
            }
            popoverContentClassName="p-4 space-y-4"
            popoverBody={
                <>
                    <div className="space-y-1.5 flex flex-col">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Prompt Message</label>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.message}
                            placeholder="Please upload a file..."
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>

                    <div className="rounded-lg bg-muted/20 border border-[var(--border-dim)] p-3 space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <VarIcon size={10} /> Save File URL To
                        </label>
                        <VariableSelect
                            value={data.variableName || ""}
                            onValueChange={(val) => updateData({ variableName: val })}
                            placeholder="Select variable..."
                        />
                        <p className="text-[9px] text-muted-foreground leading-relaxed">
                            When a file is uploaded, its URL will be saved to this variable for use in later steps.
                        </p>
                    </div>
                </>
            }
        />
    );
}
