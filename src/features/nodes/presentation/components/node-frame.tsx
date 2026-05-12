import React, { type ReactNode } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Info } from "lucide-react";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

interface NodeFrameProps {
    selected?: boolean;
    icon: ReactNode;
    title: string;
    popoverTitle: string;
    summary?: ReactNode;
    compactBody?: ReactNode;
    popoverBody?: ReactNode;
    showPopover?: boolean;
    showTargetHandle?: boolean;
    showBottomHandle?: boolean;
    targetHandleClassName?: string;
    bottomHandleClassName?: string;
    targetHandleId?: string;
    bottomHandleId?: string;
    compactClassName?: string;
    popoverClassName?: string;
    popoverContentClassName?: string;
    popoverFooter?: ReactNode;
    extraPopoverHeader?: ReactNode;
    extraContent?: ReactNode;
    description?: string;
    id?: string; // If provided, NodeFrame handles renaming automatically
}

import { useNodeContext } from "../../with-universal-delete";

export function NodeFrame({
    selected,
    icon,
    title,
    popoverTitle,
    summary,
    compactBody,
    popoverBody,
    showPopover,
    showTargetHandle = true,
    showBottomHandle = true,
    targetHandleClassName,
    bottomHandleClassName,
    targetHandleId,
    bottomHandleId,
    compactClassName,
    popoverClassName,
    popoverContentClassName,
    popoverFooter,
    extraPopoverHeader,
    extraContent,
    description,
    id: propId,
}: NodeFrameProps) {
    const nodeCtx = useNodeContext();
    const id = propId || nodeCtx?.id;
    
    // Prioritize the custom label from data over the hardcoded prop
    const displayTitle = nodeCtx?.data?.label || title;

    const { setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = React.useState(false);
    const [tempTitle, setTempTitle] = React.useState(displayTitle);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setTempTitle(displayTitle);
    }, [displayTitle]);

    const handleStartEdit = () => {
        setIsEditing(true);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }, 0);
    };

    const handleSave = () => {
        if (tempTitle.trim() && tempTitle !== title && id) {
            setNodes((nds: any[]) =>
                nds.map((node: any) =>
                    node.id === id
                        ? { ...node, data: { ...node.data, label: tempTitle.trim() } }
                        : node
                )
            );
        } else {
            setTempTitle(title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setTempTitle(title);
            setIsEditing(false);
        }
    };

    return (
        <div className="relative">
            <div
                className={cn(
                    "group flex flex-col justify-start relative w-[220px] rounded-xl p-3.5 select-none transition-all cursor-pointer",
                    "bg-[var(--node-bg)] border border-[var(--border-dim)] min-h-[85px] hover:shadow-md",
                    selected && "border-2 border-[var(--ey-yellow)] shadow-[0_0_10px_rgba(255,230,0,0.15)] -m-[1px]",
                    compactClassName
                )}
            >
                {showTargetHandle && (
                    <Handle
                        type="target"
                        position={Position.Top}
                        id={targetHandleId}
                        className={cn(
                            "h-3 w-3 border-2 border-[var(--border-dim)] bg-background shadow-sm hover:scale-125 transition-transform",
                            targetHandleClassName
                        )}
                    />
                )}

                <div className="flex flex-col gap-2.5 w-full">
                        <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                                {icon}
                            </div>
                             {isEditing ? (
                                 <div 
                                     data-is-editing="true"
                                     className="flex-1 px-2 py-0.5 rounded-md ring-1 ring-[var(--ey-yellow)] bg-[var(--ey-yellow)]/5 shadow-[0_0_8px_rgba(254,226,3,0.2)] mr-8"
                                 >
                                    <input
                                        ref={inputRef}
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        onBlur={handleSave}
                                        onKeyDown={handleKeyDown}
                                        className="bg-transparent border-none outline-none text-sm font-semibold text-foreground w-full p-0 focus:ring-0"
                                    />
                                </div>
                            ) : (
                                <div 
                                    className={cn(
                                        "flex items-center gap-1.5 group/title truncate pr-1 cursor-text",
                                        id && "hover:text-primary transition-colors"
                                    )}
                                    onDoubleClick={handleStartEdit}
                                >
                                    <span className="text-sm font-semibold text-foreground leading-none truncate">
                                        {displayTitle}
                                    </span>
                                </div>
                            )}
                        </div>

                    {summary && (
                        <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                            <span className="text-[11px] text-foreground/70 leading-snug whitespace-pre-wrap">
                                {summary}
                            </span>
                        </div>
                    )}

                    {compactBody}
                </div>

                {showBottomHandle && (
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id={bottomHandleId}
                        className={cn(
                            "h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform",
                            bottomHandleClassName
                        )}
                    />
                )}
            </div>

            {showPopover && (
                <div
                    className={cn(
                        "absolute top-0 left-[230px] w-[340px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden",
                        popoverClassName
                    )}
                >
                    <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{popoverTitle}</span>
                            {description && (
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="max-w-[240px] p-3 text-[11px] leading-relaxed bg-popover text-popover-foreground border-border shadow-xl">
                                            {description}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                        </div>
                        {extraPopoverHeader}
                    </div>

                    <div className={cn("p-4 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar", popoverContentClassName)}>
                        {popoverBody}
                    </div>

                    {popoverFooter && (
                        <div className="flex justify-end border-t border-[var(--border-dim)] px-4 py-3 bg-muted/10">
                            {popoverFooter}
                        </div>
                    )}
                </div>
            )}
            {extraContent}
        </div>
    );
}

// Static helper for field-level tooltips
NodeFrame.Tooltip = function NodeFrameTooltip({ children }: { children: React.ReactNode }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[200px] text-[10px] leading-relaxed">
                    {children}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
