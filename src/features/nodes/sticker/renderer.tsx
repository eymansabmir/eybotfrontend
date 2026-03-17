import { useState, useEffect } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { Sticker as StickerIcon, Link as LinkIcon } from "lucide-react";
import type { StickerNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { MediaUploader, useResolveUrl } from "@/lib/storage";

/** Returns true if the value looks like an absolute URL (not a storage path). */
function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

export function StickerNodeRenderer({ id, data, selected }: NodeProps & { data: StickerNodeData }) {
    const [isUploadingToMeta, setIsUploadingToMeta] = useState(false);
    const { setNodes } = useReactFlow();

    // Resolve storage path → displayable URL (skipped when the value is already a URL)
    const isPath = !!data.url && !isAbsoluteUrl(data.url);
    const { data: resolvedUrl } = useResolveUrl(isPath ? data.url : undefined, "public");
    const previewSrc = data.url ? (isPath ? resolvedUrl : data.url) : undefined;

    const updateData = (newData: Partial<StickerNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    };

    const fetchMediaId = async (url: string) => {
        if (!url || data.mediaId) return;
        
        try {
            setIsUploadingToMeta(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/whatsapp/upload-media`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, type: 'sticker' }),
            });
            
            const result = await response.json();
            if (result.success && result.mediaId) {
                updateData({ mediaId: result.mediaId });
            }
        } catch (err) {
            console.error("Failed to upload to Meta:", err);
        } finally {
            setIsUploadingToMeta(false);
        }
    };

    // Automatically trigger Meta upload when we have a displayable sticker
    useEffect(() => {
        if (previewSrc && !data.mediaId && !isUploadingToMeta) {
            fetchMediaId(previewSrc);
        }
    }, [previewSrc]);

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

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-yellow-500/10 p-1.5 text-yellow-500">
                        <StickerIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Sticker Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* URL / Path Input */}
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <LinkIcon size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Sticker URL (or Upload)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.url || ""}
                            placeholder="https://example.com/sticker.webp"
                            onChange={(e) => updateData({ url: e.target.value, mediaId: undefined })}
                        />
                    </div>
                    {data.mediaId && (
                        <div className="space-y-1.5 opacity-80">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Media ID (Meta)</span>
                            </div>
                            <div className="w-full bg-muted/30 rounded-lg border border-border/30 px-3 py-1.5 text-[10px] font-mono text-muted-foreground break-all">
                                {data.mediaId}
                            </div>
                        </div>
                    )}
                    <MediaUploader onUploadSuccess={(path) => updateData({ url: path, mediaId: undefined })} purpose="image" />
                </div>

                {/* Preview */}
                <div className="flex justify-center">
                    {previewSrc ? (
                        <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-border bg-muted/50 group/img">
                            <img
                                src={previewSrc}
                                alt="Sticker Preview"
                                className="h-full w-full object-contain transition-transform group-hover/img:scale-105"
                                onError={(e) => {
                                    e.currentTarget.src = "https://placehold.co/128x128?text=Invalid+WebP";
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                <StickerIcon size={24} className="opacity-20" />
                                <span className="text-[10px] italic">No sticker preview</span>
                            </div>
                        </div>
                    )}
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
