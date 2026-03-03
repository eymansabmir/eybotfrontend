import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { LayoutTemplate as TemplateIcon } from "lucide-react";
import type { TemplateNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function TemplateNodeRenderer({ id, data, selected }: NodeProps & { data: TemplateNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<TemplateNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    return (
        <div
            className={cn(
                "group relative min-w-[260px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
                        <TemplateIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Template Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Template Name</label>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.templateName || ""}
                        placeholder="hello_world"
                        onChange={(e) => updateData({ templateName: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Language Code</label>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.languageCode || ""}
                        placeholder="en_US"
                        onChange={(e) => updateData({ languageCode: e.target.value })}
                    />
                </div>

                {/* Template preview badge */}
                {data.templateName && (
                    <div className="rounded-xl border border-indigo-200/50 bg-indigo-500/5 px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <TemplateIcon size={12} className="text-indigo-500 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-indigo-600 truncate">{data.templateName}</p>
                                <p className="text-[9px] text-muted-foreground">{data.languageCode || "No language set"}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />
        </div>
    );
}
