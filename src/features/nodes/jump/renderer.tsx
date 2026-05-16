import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { GitBranch, ChevronsUpDown, Check } from "lucide-react";
import React from "react";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import type { JumpNodeData } from "./schema";
import { jumpNodeConfig } from "./config";
import { cn } from "@/lib/utils";

export function JumpNodeRenderer({ id, data, selected }: NodeProps & { data: JumpNodeData }) {
    const { setNodes, getNodes } = useReactFlow();
    const [open, setOpen] = React.useState(false);

    const allNodes = getNodes();
    const targetOptions = allNodes
        .filter(n => n.id !== id && n.type !== 'start')
        .map(n => {
            const data = n.data as any;
            let preview = "";
            
            if (data?.message) preview = data.message;
            else if (data?.question) preview = data.question;
            else if (data?.body) preview = data.body;
            else if (data?.text) preview = data.text;

            const contentPreview = preview 
                ? `: ${preview.slice(0, 20)}${preview.length > 20 ? '...' : ''}`
                : "";

            const label = data?.label || (n as any).label || n.type;
            
            return {
                id: n.id,
                label: `${label}${contentPreview} [${n.id.split('_').pop()}]`
            };
        });

    const updateTarget = (targetNodeId: string) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, targetNodeId } } : node
            )
        );
    };

    const selectedNode = allNodes.find(n => n.id === data.targetNodeId);
    const summary = selectedNode
        ? `Jumping to: ${(selectedNode.data as any)?.label || (selectedNode as any).label || selectedNode.type}`
        : "No target selected";

    return (
        <NodeFrame
            selected={selected}
            icon={<GitBranch size={16} />}
            title="Jump"
            popoverTitle="Configure Jump"
            description={jumpNodeConfig.description}
            summary={summary}
            showPopover={selected}
            showBottomHandle={true}
            bottomHandleId="default"
            popoverClassName="w-[300px]"
            popoverBody={
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between bg-muted/50 border-[var(--border-dim)] text-xs h-9 font-normal hover:bg-muted/70"
                                >
                                    {data.targetNodeId
                                        ? targetOptions.find((opt) => opt.id === data.targetNodeId)?.label
                                        : "Select target node..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[260px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search node..." className="h-8 text-[11px]" />
                                    <CommandList className="max-h-[250px]">
                                        <CommandEmpty>No node found.</CommandEmpty>
                                        <CommandGroup>
                                            {targetOptions.map((opt) => (
                                                <CommandItem
                                                    key={opt.id}
                                                    value={`${opt.label} ${opt.id}`}
                                                    onSelect={() => {
                                                        updateTarget(opt.id);
                                                        setOpen(false);
                                                    }}
                                                    className="text-[11px] cursor-pointer"
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-3 w-3",
                                                            data.targetNodeId === opt.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {opt.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-dim)]">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                            When this node is reached, the flow will immediately "teleport" to the selected target node.
                        </p>
                    </div>
                </div>
            }
        />
    );
}
