import { useState, useEffect } from "react";
import { useReactFlow, Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { LayoutTemplate as TemplateIcon, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { TemplateConfigForm } from "./components/template-config-form";
import type {  TemplateNodeData } from "./schema";
import { templateNode } from "./index";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

type QuickReplyButtonComponent = {
    type: "button";
    sub_type: "quick_reply";
    index: number;
    text?: string;
    parameters: Array<{
        type: "payload" | "text" | "coupon_code";
        payload?: string;
        text?: string;
        coupon_code?: string;
    }>;
};

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
            nds.map((node) => {
                if (node.id === id) {
                    const mergedData = { ...node.data, ...newData };
                    const updatedNode = { ...node, data: mergedData };

                    const quickReplyButtons: QuickReplyButtonComponent[] = mergedData.components?.filter(
                        (c): c is QuickReplyButtonComponent => c.type === 'button' && c.sub_type === 'quick_reply'
                    ) ?? [];

                    if (quickReplyButtons.length > 0) {
                        (updatedNode as any).branches = quickReplyButtons.map((btn, idx) => ({
                            key: `btn_${btn.index ?? idx}`,
                            label: btn.text || `Button ${idx + 1}`
                        }));
                    } else {
                        (updatedNode as any).branches = [{ key: 'default', label: 'Default' }];
                    }

                    return updatedNode;
                }
                return node;
            })
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
    const quickReplyButtons: QuickReplyButtonComponent[] = data.components?.filter(
        (c): c is QuickReplyButtonComponent => c.type === "button" && c.sub_type === "quick_reply"
    ) ?? [];

    return (
        <NodeFrame
            selected={selected}
            id={id}
            icon={<TemplateIcon size={16} />}
            title="Template"
            popoverTitle="Configure Template"
            description={templateNode.config.description}
            summary={data.templateName || "Configure template..."}
            showPopover={selected}
            showBottomHandle={quickReplyButtons.length === 0}
            popoverClassName="w-[380px]"
            compactBody={
                hasComponents && (
                    <div className="flex flex-col gap-1.5 w-full mt-1.5">
                        {/* Status Pills */}
                        <div className="flex flex-wrap gap-1">
                            {data.components?.some(c => c.type === "header") && (
                                <span className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">HDR</span>
                            )}
                            {data.components?.some(c => c.type === "body") && (
                                <span className="bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight">BODY</span>
                            )}
                        </div>

                        {/* Template Content Preview */}
                        {data.previewText && (
                            <p className="text-[10px] text-muted-foreground/75 font-normal leading-normal line-clamp-2 mt-1 border-t border-muted/20 pt-1.5 max-w-[200px] break-words italic">
                                "{data.previewText}"
                            </p>
                        )}

                        {/* Dynamic Quick Reply Handles */}
                        {quickReplyButtons.map((btn, idx) => (
                            <div key={idx} className="relative bg-background rounded px-2 py-1 text-[10px] font-medium text-foreground border border-[var(--border-dim)] shadow-sm flex items-center mt-1">
                                <span className="truncate">{btn.text || `Button ${idx + 1}`}</span>
                                <Handle
                                    type="source"
                                    id={`btn_${btn.index ?? idx}`}
                                    position={Position.Right}
                                    className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground border-2 border-background hover:bg-[var(--ey-yellow)] transition-colors"
                                />
                            </div>
                        ))}
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
