import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Video as VideoIcon, Link as LinkIcon, Type } from "lucide-react";
import type { VideoNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { MediaUploader } from "@/components/MediaUploader";

export function VideoNodeRenderer({ id, data, selected }: NodeProps & { data: VideoNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<VideoNodeData>) => {
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
                    <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-500">
                        <VideoIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Video Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <LinkIcon size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Video URL (or Upload)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.url || ""}
                            placeholder="https://example.com/video.mp4"
                            onChange={(e) => updateData({ url: e.target.value })}
                        />
                    </div>
                    <MediaUploader onUploadSuccess={(url) => updateData({ url })} folder="bot-media" />
                </div>

                {data.url ? (
                    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted/50">
                        <video
                            src={data.url}
                            className="w-full max-h-32 object-cover"
                            controls={false}
                            preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <VideoIcon size={24} className="text-white opacity-80" />
                        </div>
                    </div>
                ) : (
                    <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                            <VideoIcon size={20} className="opacity-20" />
                            <span className="text-[10px] italic">No video preview</span>
                        </div>
                    </div>
                )}

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
