import { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { LayoutTemplate as TemplateIcon, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { TemplateConfigForm } from "./components/template-config-form";
import type { TemplateNodeData } from "./schema";

export function TemplateNodeRenderer({ id, data, selected }: NodeProps & { data: TemplateNodeData }) {
    const { setNodes } = useReactFlow();
    const [configOpen, setConfigOpen] = useState(false);
    const [draft, setDraft] = useState<TemplateNodeData>(() => ({
        templateName: data.templateName || "",
        languageCode: data.languageCode || "en_US",
        components: data.components || [],
    }));

    const updateNodeData = (newData: Partial<TemplateNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    const openConfig = () => {
        setDraft({
            templateName: data.templateName || "",
            languageCode: data.languageCode || "en_US",
            components: data.components || [],
        });
        setConfigOpen(true);
    };

    const onSaveConfig = () => {
        if (!draft.templateName.trim()) {
            toast.error("Template name is required");
            return;
        }

        updateNodeData(draft);
        setConfigOpen(false);
        toast.success("Template node updated");
    };

    const hasComponents = data.components && data.components.length > 0;
    const buttonCount = data.components?.filter(c => c.type === "button").length || 0;

    return (
        <>
            <div
                onClick={openConfig}
                className={cn(
                    "group relative min-w-[200px] max-w-[280px] cursor-pointer rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                    selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border shadow-sm"
                )}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
                            <TemplateIcon size={14} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                            Template Message
                        </span>
                    </div>
                    <Settings2 size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="p-4 space-y-3">
                    <div className="min-w-0">
                        <p className={cn(
                            "text-sm font-semibold truncate",
                            data.templateName ? "text-foreground" : "text-muted-foreground italic"
                        )}>
                            {data.templateName || "Click to configure..."}
                        </p>
                        {data.templateName && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Lang: <span className="font-mono">{data.languageCode}</span>
                            </p>
                        )}
                    </div>

                    {hasComponents && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                            {data.components?.some(c => c.type === "header") && (
                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Header</span>
                            )}
                            {data.components?.some(c => c.type === "body") && (
                                <span className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">Body</span>
                            )}
                            {buttonCount > 0 && (
                                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">{buttonCount} Buttons</span>
                            )}
                        </div>
                    )}
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
                />
            </div>

            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                <DialogContent className="flex max-h-[85vh] max-w-md flex-col overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader className="px-6 pt-6">
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <TemplateIcon className="size-5 text-indigo-500" />
                            WhatsApp Template
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Configure your WhatsApp Template message components and parameters.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                        <TemplateConfigForm 
                            data={draft} 
                            onChange={(patch) => setDraft(prev => ({ ...prev, ...patch }))} 
                        />
                    </div>

                    <div className="flex justify-end border-t border-border/50 px-6 py-4 bg-muted/20">
                        <Button onClick={onSaveConfig} size="sm" className="h-9 gap-2 font-semibold shadow-sm">
                            <Save className="size-4" />
                            Save Configuration
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
