import type { NodeProps } from "@xyflow/react";
import { Image as ImageIcon, Type } from "lucide-react";
import type { ImageNodeData } from "./schema";
import { useResolveUrl, MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
        <NodeFrame
            selected={selected}
            icon={<ImageIcon size={16} />}
            title="Image"
            popoverTitle="Configure Image"
            summary={data.url ? "1 file attached" : "Click to configure image placeholder..."}
            showPopover={selected}
            popoverBody={
                <div className="space-y-5">
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
            }
        />
    );
}
