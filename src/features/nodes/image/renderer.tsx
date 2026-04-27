import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Image as ImageIcon, Type } from "lucide-react";
import type { ImageNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { MediaUploader, useResolveUrl } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ImageNodeRenderer({ id, data, selected }: NodeProps & { data: ImageNodeData }) {
    const { setNodes } = useReactFlow();
    const { data: previewSrc } = useResolveUrl(data.url, "public");

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

                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                            <ImageIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold truncate text-foreground leading-none">Image</span>
                    </div>
                    
                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.url ? "1 file attached" : "Click to configure image placeholder..."}
                        </span>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                />
            </div>

            {/* 2) Popover Configuration Panel (attached relative to Node) */}
            {selected && (
                <div 
                    className="absolute top-0 left-[230px] w-[340px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Image</span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-5">
                        {/* Segmented Control for Upload vs URL */}
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
                                <MediaUploader onUploadSuccess={(path) => updateData({ url: path })} purpose="image" />
                            </TabsContent>
                            
                            <TabsContent value="url" className="pt-4 mt-0 space-y-3 outline-none">
                                <div className="space-y-1.5">
                                    <input
                                        type="text"
                                        className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={data.url || ""}
                                        placeholder="https://example.com/image.jpg"
                                        onChange={(e) => updateData({ url: e.target.value })}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Preview */}
                        {previewSrc ? (
                            <div className="group/img relative aspect-video w-full overflow-hidden rounded-lg border border-[var(--border-dim)] bg-background">
                                <img
                                    src={previewSrc}
                                    alt={data.caption || "Node Preview"}
                                    className="h-full w-full object-contain transition-transform group-hover/img:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.co/400x225?text=Invalid+Image";
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-[var(--border-dim)] bg-muted/10">
                                <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                                    <ImageIcon size={18} />
                                    <span className="text-[10px]">No image preview</span>
                                </div>
                            </div>
                        )}

                        {/* Caption */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                <Type size={10} /> Caption (Optional)
                            </label>
                            <input
                                type="text"
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.caption || ""}
                                placeholder="Add a caption..."
                                onChange={(e) => updateData({ caption: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

