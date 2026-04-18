import { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { LayoutTemplate as TemplateIcon, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { TemplateConfigForm } from "./components/template-config-form";
import type { TemplateNodeData } from "./schema";

export function TemplateNodeRenderer({ id, data, selected }: NodeProps & { data: TemplateNodeData }) {
    const { setNodes } = useReactFlow();
    const [draft, setDraft] = useState<TemplateNodeData>(() => ({
        templateName: data.templateName || "",
        languageCode: data.languageCode || "en_US",
        components: data.components || [],
    }));

    // Keep draft in sync if data changes externally
    useEffect(() => {
        setDraft({
            templateName: data.templateName || "",
            languageCode: data.languageCode || "en_US",
            components: data.components || [],
        });
    }, [data, selected]);

    const updateNodeData = (newData: Partial<TemplateNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    const onSaveConfig = () => {
        if (!draft.templateName.trim()) {
            toast.error("Template name is required");
            return;
        }

        updateNodeData(draft);
        toast.success("Template node updated");
    };

    const hasComponents = data.components && data.components.length > 0;
    const buttonCount = data.components?.filter(c => c.type === "button").length || 0;

    return (
        <div className="relative">
            {/* 1) Condensed Block Face */}
            <div
                className={cn(
                    "flex flex-col justify-center relative w-[220px] min-h-[85px] rounded-xl border p-3.5 select-none transition-all cursor-pointer",
                    "bg-[var(--node-bg)] border-[var(--border-dim)] hover:shadow-md",
                    selected && "border-2 border-[var(--ey-yellow)] shadow-[0_0_10px_rgba(255,230,0,0.15)] -m-[1px]"
                )}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className="h-3 w-3 border-2 border-[var(--border-dim)] bg-background shadow-sm hover:scale-125 transition-transform"
                />

                <div className="flex flex-col gap-2.5 w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                            <TemplateIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold truncate text-foreground leading-none pr-1">Template</span>
                    </div>

                    <div className="min-w-0 flex flex-col">
                        <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.templateName || "Configure template..."}
                        </span>
                    </div>
                        
                        {hasComponents && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                                {data.components?.some(c => c.type === "header") && (
                                    <span className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">HDR</span>
                                )}
                                {data.components?.some(c => c.type === "body") && (
                                    <span className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">BODY</span>
                                )}
                                {buttonCount > 0 && (
                                    <span className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">{buttonCount} BTN</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                />
            </div>

            {/* 2) Popover Configuration Panel */}
            {selected && (
                <div 
                    className="absolute top-0 left-[230px] w-[380px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <TemplateIcon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Template</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar p-4">
                        <TemplateConfigForm 
                            data={draft} 
                            onChange={(patch) => setDraft(prev => ({ ...prev, ...patch }))} 
                        />
                    </div>

                    <div className="flex justify-end border-t border-[var(--border-dim)] px-4 py-3 bg-muted/10">
                        <Button 
                            onClick={onSaveConfig} 
                            size="sm" 
                            className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
                        >
                            <Save className="size-3.5" />
                            Save Configuration
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
