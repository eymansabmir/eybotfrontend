import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Image as ImageIcon, Link as LinkIcon, Type } from "lucide-react";
import type { ImageNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { MediaUploader, useResolveUrl } from "@/lib/storage";

/** Returns true if the value looks like an absolute URL (not a storage path). */
function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

export function ImageNodeRenderer({ id, data, selected }: NodeProps & { data: ImageNodeData }) {
    const { setNodes } = useReactFlow();

    // Resolve storage path → displayable URL (skipped when the value is already a URL)
    const isPath = !!data.url && !isAbsoluteUrl(data.url);
    const { data: resolvedUrl } = useResolveUrl(isPath ? data.url : undefined, "public");
    const previewSrc = data.url ? (isPath ? resolvedUrl : data.url) : undefined;

    const updateData = (newData: Partial<ImageNodeData>) => {
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
        <div
            className={cn(
                "group relative w-[280px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
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
                    <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-500">
                        <ImageIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Image Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* URL / Path Input */}
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <LinkIcon size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Image URL (or Upload)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.url || ""}
                            placeholder="https://example.com/image.jpg"
                            onChange={(e) => updateData({ url: e.target.value })}
                        />
                    </div>
                    <MediaUploader onUploadSuccess={(path) => updateData({ url: path })} purpose="image" />
                </div>

                {/* Preview */}
                {previewSrc ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/50 group/img">
                        <img
                            src={previewSrc}
                            alt={data.caption || "Node Image"}
                            className="h-full w-full object-contain transition-transform group-hover/img:scale-105"
                            onError={(e) => {
                                e.currentTarget.src = "https://placehold.co/400x225?text=Invalid+Image+URL";
                            }}
                        />
                    </div>
                ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <ImageIcon size={20} className="opacity-20" />
                            <span className="text-[10px] italic">No image preview</span>
                        </div>
                    </div>
                )}

                {/* Caption Input */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Type size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Caption</label>
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
