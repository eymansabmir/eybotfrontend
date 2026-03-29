import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Music as MusicIcon, Link as LinkIcon } from "lucide-react";
import type { AudioNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { MediaUploader } from "@/lib/storage";

export function AudioNodeRenderer({ id, data, selected }: NodeProps & { data: AudioNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<AudioNodeData>) => {
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
                    <div className="rounded-lg bg-green-500/10 p-1.5 text-green-500">
                        <MusicIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Audio Message
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <LinkIcon size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Audio URL (or Upload)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.url || ""}
                            placeholder="https://example.com/audio.mp3"
                            onChange={(e) => updateData({ url: e.target.value })}
                        />
                    </div>
                    <MediaUploader onUploadSuccess={(path) => updateData({ url: path })} purpose="audio" />
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
                    <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                        <MusicIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                            <div className="h-full w-1/3 rounded-full bg-green-500/40" />
                        </div>
                        <p className="mt-1.5 text-[9px] text-muted-foreground truncate">
                            {data.url ? (data.url.split('/').pop() || 'audio file') : 'audio file'}
                        </p>
                    </div>
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
