import type { NodeProps } from "@xyflow/react";
import { ExternalLink, Info } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import type { RedirectNodeData } from "./schema";
import { RedirectNodeConfig } from "./config";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function RedirectNodeRenderer({ id, data, selected }: NodeProps & { data: RedirectNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<RedirectNodeData>) => {
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
            icon={<ExternalLink size={16} />}
            title="Redirect"
            popoverTitle="Configure Redirect"
            description={RedirectNodeConfig.description}
            summary={data.url ? `Redirect to ${data.url}` : "Click to configure redirect..."}
            showPopover={selected}
            popoverContentClassName="p-4 space-y-5"
            popoverBody={
                <>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">URL</Label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        The URL to redirect the user to. You can use {"{{variable}}"} syntax.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Input
                            className="w-full bg-background rounded-xl border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all placeholder:italic"
                            value={data.url || ""}
                            placeholder="https://example.com"
                            onChange={(e) => updateData({ url: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="new-tab"
                            checked={data.isNewTab}
                            onCheckedChange={(checked) => updateData({ isNewTab: checked })}
                        />
                        <Label htmlFor="new-tab" className="text-sm">Open in new tab</Label>
                    </div>
                </>
            }
        />
    );
}
