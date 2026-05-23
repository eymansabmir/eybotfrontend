import type { NodeProps } from "@xyflow/react";
import { FileUp, Variable as VarIcon } from "lucide-react";
import type { FileNodeData } from "./schema";
import { fileNode } from "./index";
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
            description={fileNode.config.description}
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
                        <div className="flex items-center gap-1.5 mb-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Prompt Message</label>
                            <NodeFrame.Tooltip>
                                The message sent to user to ask for a file. Max 1024 characters.
                            </NodeFrame.Tooltip>
                        </div>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.message}
                            maxLength={1024}
                            placeholder="Please upload a file..."
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>

                    <div className="rounded-lg bg-muted/20 border border-[var(--border-dim)] p-3 space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <VarIcon size={10} /> Save File URL To
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <VariableSelect
                                    value={data.variableName || ""}
                                    onValueChange={(val) => updateData({ variableName: val })}
                                    placeholder="Select variable..."
                                />
                            </div>
                            <div className="w-24 shrink-0">
                                <select
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-2 h-8 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_auto] bg-[position:right_8px_center] bg-no-repeat pr-6"
                                    value={data.variableScope || "session"}
                                    onChange={(e) => updateData({ variableScope: e.target.value as any })}
                                >
                                    <option value="session">Session</option>
                                    <option value="contact">Contact</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed">
                            When a file is uploaded, its URL will be saved to this variable for use in later steps.
                        </p>
                    </div>
                </>
            }
        />
    );
}
