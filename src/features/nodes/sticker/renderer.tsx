import { useState, useEffect } from "react";
import { type NodeProps } from "@xyflow/react";
import { Sticker as StickerIcon, Link as LinkIcon } from "lucide-react";
import type { StickerNodeData } from "./schema";
import { MediaUploader, useResolveUrl } from "@/lib/storage";
import { ENV } from "@/config/env";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { isDynamicVariable } from "../utils";

/** Returns true if the value looks like an absolute URL (not a storage path). */
function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

export function StickerNodeRenderer({ id, data, selected }: NodeProps & { data: StickerNodeData }) {
    const [isUploadingToMeta, setIsUploadingToMeta] = useState(false);
    const { setNodes } = useReactFlow();

    // Resolve storage path → displayable URL (skipped when the value is already a URL)
    const isVariable = isDynamicVariable(data.url);
    const isPath = !!data.url && !isAbsoluteUrl(data.url) && !isVariable;
    const { data: resolvedUrl } = useResolveUrl(isPath ? data.url : undefined, "public");
    const previewSrc = data.url ? (isPath ? resolvedUrl : (isVariable ? undefined : data.url)) : undefined;

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
        if (previewSrc && !data.mediaId && !isUploadingToMeta && !isVariable) {
            fetchMediaId(previewSrc);
        }
    }, [previewSrc, isVariable]);

    return (
        <NodeFrame
            selected={selected}
            icon={<StickerIcon size={16} />}
            title="Sticker"
            popoverTitle="Configure Sticker"
            summary={isVariable ? `Dynamic: ${data.url}` : (data.url ? "1 attached sticker" : "Upload a sticker...")}
            showPopover={selected}
            popoverBody={
                <div className="space-y-4">
                    <Tabs defaultValue={isVariable ? "url" : "upload"} className="w-full">
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
                                URL / Variable
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
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Source URL or Variable</label>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.url || ""}
                                    placeholder="https://example.com/sticker.webp or {{var}}"
                                    onChange={(e) => updateData({ url: e.target.value, mediaId: undefined })}
                                />
                                <p className="text-[10px] text-muted-foreground self-start">
                                    Use <code className="text-primary font-bold">{`{{variable_name}}`}</code> to use a dynamic sticker.
                                </p>
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
                        {isVariable ? (
                             <div className="flex h-32 w-32 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                                    <StickerIcon size={20} />
                                </div>
                                <span className="text-[10px] font-bold text-primary leading-tight">Dynamic Sticker</span>
                                <span className="mt-1 text-[8px] text-muted-foreground break-all line-clamp-2">
                                    {data.url}
                                </span>
                            </div>
                        ) : previewSrc ? (
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
            }
        />
    );
}
