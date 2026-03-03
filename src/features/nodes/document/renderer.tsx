import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { FileText as FileTextIcon, Link as LinkIcon, Type } from "lucide-react";
import type { DocumentNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function DocumentNodeRenderer({ id, data, selected }: NodeProps & { data: DocumentNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<DocumentNodeData>) => {
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
                    <div className="rounded-lg bg-orange-500/10 p-1.5 text-orange-500">
                        <FileTextIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Document Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <LinkIcon size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Document URL</label>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.url || ""}
                        placeholder="https://example.com/file.pdf"
                        onChange={(e) => updateData({ url: e.target.value })}
                    />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
                    <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                        <FileTextIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate text-foreground/80">
                            {data.filename || (data.url ? (data.url.split('/').pop() || 'document') : 'document')}
                        </p>
                        <p className="text-[9px] text-muted-foreground">Document file</p>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Type size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Filename (optional)</label>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.filename || ""}
                        placeholder="receipt.pdf"
                        onChange={(e) => updateData({ filename: e.target.value })}
                    />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Type size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Caption (optional)</label>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.caption || ""}
                        placeholder="Add a caption..."
                        onChange={(e) => updateData({ caption: e.target.value })}
                    />
                </div>
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />
        </div>
    );
}
