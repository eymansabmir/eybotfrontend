import { useState, useEffect } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { Sticker as StickerIcon, Link as LinkIcon } from "lucide-react";
import type { StickerNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { MediaUploader, useResolveUrl } from "@/lib/storage";
import { ENV } from "@/config/env";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
            const response = await fetch(`${ENV.API_URL}/whatsapp/upload-media`, {
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
                            <StickerIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-none pr-1 truncate">Sticker</span>
                    </div>
                    
                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.url ? "1 attached sticker" : "Upload a sticker..."}
                        </span>
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
                    className="absolute top-0 left-[230px] w-[340px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <StickerIcon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Sticker</span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="grid grid-cols-2 bg-muted/40 p-1 h-9 rounded-lg border border-[var(--border-dim)]">
                                <TabsTrigger 
                                    value="upload" 
                                    className="text-[11px] font-medium rounded-md data-[state=active]:bg-[var(--ey-yellow)] data-[state=active]:text-black transition-colors"
                                >
                                    Upload File
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="url" 
                                    className="text-[11px] font-medium rounded-md data-[state=active]:bg-[var(--ey-yellow)] data-[state=active]:text-black transition-colors"
                                >
                                    Direct URL
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="upload" className="pt-4 mt-0 space-y-4 outline-none">
                                <MediaUploader onUploadSuccess={(path) => updateData({ url: path, mediaId: undefined })} purpose="image" />
                                {data.mediaId && (
                                    <div className="w-full mt-2">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Media ID (Meta)</span>
                                        </div>
                                        <div className="bg-muted/10 rounded-md border border-[var(--border-dim)] px-3 py-1.5 text-[10px] font-mono text-muted-foreground break-all">
                                            {data.mediaId}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="url" className="pt-4 mt-0 space-y-3 outline-none">
                                <div className="space-y-1.5 flex flex-col items-center">
                                    <div className="flex w-full items-center gap-1.5 mb-1">
                                        <LinkIcon size={10} className="text-muted-foreground" />
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Sticker URL</label>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={data.url || ""}
                                        placeholder="https://example.com/sticker.webp"
                                        onChange={(e) => updateData({ url: e.target.value, mediaId: undefined })}
                                    />
                                    {data.mediaId && (
                                        <div className="w-full mt-2">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Media ID (Meta)</span>
                                            </div>
                                            <div className="bg-muted/10 rounded-md border border-[var(--border-dim)] px-3 py-1.5 text-[10px] font-mono text-muted-foreground break-all">
                                                {data.mediaId}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Preview */}
                        <div className="flex justify-center mt-4 pt-4 border-t border-[var(--border-dim)]">
                            {previewSrc ? (
                                <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-[var(--border-dim)] bg-muted/10 group/img">
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
                                <div className="flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-[var(--border-dim)] bg-muted/10">
                                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                        <StickerIcon size={24} className="opacity-20" />
                                        <span className="text-[10px] italic">No sticker</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
