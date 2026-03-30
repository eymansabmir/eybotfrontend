import React, { useMemo } from "react";
import { nodeRegistry } from "../../registry";
import type { NodeDefinition } from "../../types";
import { NodeType, type NodeTypeValue } from "../../node-types.constants";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function NodePalette() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    const groupedNodes = useMemo(() => {
        const outputTypes = new Set<NodeTypeValue>([
            NodeType.SEND_TEXT,
            NodeType.SEND_IMAGE,
            NodeType.SEND_STICKER,
            NodeType.SEND_VIDEO,
            NodeType.SEND_AUDIO,
            NodeType.SEND_DOCUMENT,
            NodeType.SEND_LOCATION,
            NodeType.SEND_TEMPLATE,
        ]);
        const inputTypes = new Set<NodeTypeValue>([
            NodeType.ASK_QUESTION,
            NodeType.LOCATION_REQUEST,
            NodeType.NPS,
            NodeType.ASK_FILE,
            NodeType.LANGUAGE,
            NodeType.SEND_BUTTONS,
            NodeType.SEND_LIST,
            NodeType.SEND_CARDS,
            NodeType.SEND_CAROUSEL,
        ]);
        const integrationTypes = new Set<NodeTypeValue>([
            NodeType.HTTP_REQUEST,
            NodeType.OPENAI,
            NodeType.ELEVENLABS,
            NodeType.GOOGLE_SHEETS,
            NodeType.NOCODB,
            NodeType.ANTHROPIC,
            NodeType.DEEPSEEK,
        ]);

        return Object.values(nodeRegistry).reduce(
            (acc, node) => {
                const type = node.config.type as NodeTypeValue;
                if (outputTypes.has(type)) {
                    acc.output.push(node);
                } else if (inputTypes.has(type)) {
                    acc.input.push(node);
                } else if (integrationTypes.has(type)) {
                    acc.integration.push(node);
                } else {
                    acc.logical.push(node);
                }
                return acc;
            },
            { output: [] as NodeDefinition[], input: [] as NodeDefinition[], integration: [] as NodeDefinition[], logical: [] as NodeDefinition[] }
        );
    }, []);

    const categories: Array<{
        key: keyof typeof groupedNodes;
        title: string;
        accent: string;
        nodes: NodeDefinition[];
    }> = [
        { key: "output", title: "Output Nodes", accent: "text-sky-500", nodes: groupedNodes.output },
        { key: "input", title: "Input Nodes", accent: "text-emerald-500", nodes: groupedNodes.input },
        { key: "integration", title: "Integration Nodes", accent: "text-violet-500", nodes: groupedNodes.integration },
        { key: "logical", title: "Logical Nodes", accent: "text-amber-500", nodes: groupedNodes.logical },
    ];

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-[80vh] w-[300px] flex-col rounded-2xl border border-border bg-card/90 shadow-xl backdrop-blur-md">
                <div className="border-b border-border/60 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Node Library</p>
                    <p className="text-[10px] text-muted-foreground/70">Drag nodes into the canvas</p>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                    {categories.map(({ key, title, accent, nodes }) => (
                        <div key={key} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                <span className={cn("text-[10px] font-bold uppercase tracking-widest", accent)}>{title}</span>
                                <div className="h-px flex-1 bg-border/50" />
                            </div>
                            {nodes.length ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {nodes.map((node) => (
                                        <NodePaletteItem key={node.config.type} node={node} onDragStart={onDragStart} />
                                    ))}
                                </div>
                            ) : (
                                <p className="px-1 text-[9px] text-muted-foreground">No nodes yet</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </TooltipProvider>
    );
}

interface NodePaletteItemProps {
    node: NodeDefinition;
    onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function NodePaletteItem({ node, onDragStart }: NodePaletteItemProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className={cn(
                        "flex items-center gap-2 w-full h-11 p-2 cursor-grab rounded-xl transition-all active:cursor-grabbing",
                        "bg-muted/30 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20",
                        "group relative"
                    )}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.config.type)}
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border group-hover:border-primary/30 shadow-sm transition-colors">
                        {node.config.icon}
                    </div>

                    <span className="text-xs font-medium tracking-tight truncate">{node.config.label}</span>

                    {/* Subtle drag handle indicator only visible on hover */}
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="grid grid-cols-2 gap-0.5">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="size-0.5 rounded-full bg-primary/40" />
                            ))}
                        </div>
                    </div>

                    {/* Subtle active state indicator */}
                    <div className="absolute left-0 h-4 w-1 rounded-r-full bg-primary scale-y-0 transition-transform group-hover:scale-y-100" />
                </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground border-border shadow-md">
                <p className="text-[10px] text-muted-foreground max-w-[150px] leading-tight">
                    {node.config.description}
                </p>
            </TooltipContent>
        </Tooltip>
    );
}
