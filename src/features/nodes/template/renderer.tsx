import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { LayoutTemplate as TemplateIcon, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TemplateConfigForm } from "./components/template-config-form";
import type { TemplateNodeData } from "./schema";
import { templateNode } from "./index";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
        <NodeFrame
            selected={selected}
            icon={<TemplateIcon size={16} />}
            title="Template"
            popoverTitle="Configure Template"
            description={templateNode.config.description}
            summary={data.templateName || "Configure template..."}
            showPopover={selected}
            popoverClassName="w-[380px]"
            compactBody={
                hasComponents && (
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
                )
            }
            popoverBody={
                <div className="space-y-4">
                    <TemplateConfigForm 
                        data={draft} 
                        onChange={(patch) => setDraft(prev => ({ ...prev, ...patch }))} 
                    />
                </div>
            }
            popoverFooter={
                <Button 
                    onClick={onSaveConfig} 
                    size="sm" 
                    className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
                >
                    <Save className="size-3.5" />
                    Save Configuration
                </Button>
            }
        />
    );
}
