import type { NodeProps } from "@xyflow/react";
import { Keyboard, Variable, ShieldCheck, Info } from "lucide-react";
import type { InputNodeData } from "./schema";
import { inputNode } from "./index";
import { useReactFlow } from "@xyflow/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { LockedBadge } from "@/components/ui/locked-badge";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";



export function InputNodeRenderer({ id, data, selected }: NodeProps & { data: InputNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes } = useReactFlow();
    const isTranslationMode = !!data.isTranslationMode;

    const updateData = (newData: Partial<InputNodeData>) => {
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
            icon={<Keyboard size={16} />}
            title="Wait for Reply"
            popoverTitle="Configure User Input"
            description={inputNode.config.description}
            summary={data.question ? data.question : "Click to set question..."}
            showPopover={selected}
            popoverContentClassName="p-4 space-y-5"
            popoverBody={
                <>
                    {/* Question Text */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight text-foreground/60 flex items-center gap-1.5">
                                <Keyboard size={10} /> Question
                            </label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        The question that will be sent to the user to prompt their response.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-xl border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.question}
                            placeholder="What would you like to ask?"
                            onChange={(e) => updateData({ question: e.target.value })}
                        />
                    </div>

                    {/* Variable Mapping */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 border-t border-border/50 pt-4">
                            <Variable size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight text-foreground/60">Save Answer To</label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        Select or create a variable where the user's response will be stored.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {isTranslationMode && <LockedBadge />}
                        </div>
                        <div className="relative">
                            <VariableSelect 
                                value={data.variable || ""} 
                                onValueChange={(val: string) => updateData({ variable: val })} 
                                placeholder="e.g. user_age" 
                                className={isTranslationMode ? "opacity-50 pointer-events-none" : ""}
                            />
                        </div>
                    </div>

                    {/* Validation Type */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 border-t border-border/50 pt-4">
                            <ShieldCheck size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight text-foreground/60">Validation</label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        Enforce specific formats for the user's input (e.g., must be an email).
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            {isTranslationMode && <LockedBadge />}
                        </div>
                        <select
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all appearance-none disabled:opacity-50"
                            value={data.validationType}
                            onChange={(e) => updateData({ validationType: e.target.value as any })}
                            disabled={isTranslationMode}
                        >
                            <option value="text">Any Text</option>
                            <option value="number">Number Only</option>
                            <option value="email">Email Address</option>
                            <option value="phone">Phone Number</option>
                        </select>
                    </div>
                </>
            }
        />
    );
}
