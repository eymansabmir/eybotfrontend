import type { NodeProps } from "@xyflow/react";
import { Video as VideoIcon, Link as LinkIcon, Type } from "lucide-react";
import type { VideoNodeData } from "./schema";
import { useResolveUrl, MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

/** Returns true if the value looks like an absolute URL (not a storage path). */
function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

export function VideoNodeRenderer({ id, data, selected }: NodeProps & { data: VideoNodeData }) {
    const { setNodes } = useReactFlow();

    const isPath = !!data.url && !isAbsoluteUrl(data.url);
    const { data: resolvedUrl } = useResolveUrl(isPath ? data.url : undefined, "public");
    const previewSrc = data.url ? (isPath ? resolvedUrl : data.url) : undefined;

    const updateData = (newData: Partial<VideoNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<VideoIcon size={16} />}
            title="Video"
            popoverTitle="Configure Video"
            summary={data.caption || (data.url ? "1 attached video" : "Upload an video...")}
            showPopover={selected}
            popoverBody={
                <div className="space-y-4">
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
                            <MediaUploader onUploadSuccess={(path) => updateData({ url: path })} purpose="video" />
                        </TabsContent>
                        
                        <TabsContent value="url" className="pt-4 mt-0 space-y-3 outline-none">
                            <div className="space-y-1.5 flex flex-col items-center">
                                <div className="flex w-full items-center gap-1.5 mb-1">
                                    <LinkIcon size={10} className="text-muted-foreground" />
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Video URL</label>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.url || ""}
                                    placeholder="https://example.com/video.mp4"
                                    onChange={(e) => updateData({ url: e.target.value })}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {previewSrc ? (
                        <div className="relative w-full overflow-hidden rounded-lg border border-[var(--border-dim)] bg-background mt-4 p-1">
                            <video
                                src={previewSrc}
                                className="w-full max-h-32 object-cover rounded-md"
                                controls={false}
                                preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none rounded-md m-1">
                                <VideoIcon size={24} className="text-white opacity-80" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-20 w-full items-center justify-center rounded-lg border border-dashed border-[var(--border-dim)] bg-muted/10 mt-4">
                            <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                <VideoIcon size={16} className="opacity-40" />
                                <span className="text-[10px] italic">No video preview</span>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Type size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Caption (Optional)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
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
