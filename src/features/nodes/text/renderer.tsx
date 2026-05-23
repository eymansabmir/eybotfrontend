import type { NodeProps } from "@xyflow/react";
import { MessageSquare, X, Info } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import type { TextNodeData } from "./schema";
import { textNode } from "./index";
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


    return (
        <NodeFrame
            selected={selected}
            id={id}
            icon={<MessageSquare size={16} />}
            title={data.label || "Text Message"}
            popoverTitle="Configure Text"
            description={textNode.config.description}
            summary={data.message ? data.message : "Click to configure message..."}
            showPopover={selected}
            popoverContentClassName="p-4 space-y-5"
            popoverBody={
                <>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Content</label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        The main text message body. You can use {"{{variable}}"} to personalize it.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-xl border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all placeholder:italic"
                            value={data.message}
                            placeholder="Type your message here..."
                            onChange={(e) => updateData({ message: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Footer (Optional)</label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        Small grey text that appears at the bottom of the message. Max 60 characters.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <textarea
                            className="w-full min-h-[60px] bg-background rounded-xl border border-[var(--border-dim)] p-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] resize-y transition-all placeholder:italic opacity-80"
                            value={data.footer || ""}
                            maxLength={60}
                            placeholder="Type footer text (optional)..."
                            onChange={(e) => updateData({ footer: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Save Message To Variable</label>
                            {isTranslationMode && <LockedBadge />}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                                <VariableSelect
                                    value={data.variableName || ""}
                                    onValueChange={(val: string) => updateData({ variableName: val })}
                                    placeholder="Select variable..."
                                    className={isTranslationMode ? "opacity-50 pointer-events-none" : ""}
                                />
                            </div>
                            <div className="w-24 shrink-0">
                                <select
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-2 h-8 text-[10px] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all cursor-pointer disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_auto] bg-[position:right_8px_center] bg-no-repeat pr-6"
                                    value={data.variableScope || "session"}
                                    onChange={(e) => updateData({ variableScope: e.target.value as any })}
                                    disabled={isTranslationMode}
                                >
                                    <option value="session">Session</option>
                                    <option value="contact">Contact</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                            If selected, the sent message will be stored in this variable for use in later steps.
                        </p>
                    </div>
                </>
            }
        />
    );
}
