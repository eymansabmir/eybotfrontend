import { useEffect } from "react";
import type { NodeProps } from "@xyflow/react";
import { Video as VideoIcon, Link as LinkIcon, Type } from "lucide-react";
import type { VideoNodeData } from "./schema";
import { videoNode } from "./index";
import { useResolveUrl, MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { isDynamicVariable } from "../utils";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { validateMediaUrl, validateMediaUrlRemote } from "@/lib/storage/application/validation";

/** Returns true if the value looks like an absolute URL (not a storage path). */
function isAbsoluteUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

export function VideoNodeRenderer({ id, data, selected }: NodeProps & { data: VideoNodeData }) {
    const { setNodes } = useReactFlow();

    const isVariable = isDynamicVariable(data.url);
    const isPath = !!data.url && !isAbsoluteUrl(data.url) && !isVariable;
    const { data: resolvedUrl } = useResolveUrl(isPath ? data.url : undefined, "public");
    const previewSrc = data.url ? (isPath ? resolvedUrl : (isVariable ? undefined : data.url)) : undefined;

    // Remote validation for external URLs (checks size/availability)
    useEffect(() => {
        if (!data.url || data.validationError || !data.url.startsWith("http")) return;
        
        const timer = setTimeout(async () => {
            const result = await validateMediaUrlRemote(data.url, "video");
            if (!result.isValid) {
                updateData({ validationError: result.error || "Size limit exceeded" });
            }
        }, 800);
        
        return () => clearTimeout(timer);
    }, [data.url]);

    const updateData = (newData: Partial<VideoNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    const getSummary = () => {
        if (!data.url) return "Upload a video...";
        if (isVariable) return `Dynamic: ${data.url}`;
        return data.caption || "1 attached video";
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<VideoIcon size={16} />}
            title="Video"
            popoverTitle="Configure Video"
            description={videoNode.config.description}
            summary={getSummary()}
            showPopover={selected}
            error={data.validationError}
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
                            <MediaUploader onUploadSuccess={(path) => updateData({ url: path, validationError: undefined })} purpose="video" />
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
                                    placeholder="https://example.com/video.mp4 or {{var}}"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const validation = validateMediaUrl(val, "video");
                                        updateData({ 
                                            url: val, 
                                            validationError: validation.isValid ? undefined : (validation.error || "Invalid Video")
                                        });
                                    }}
                                />
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-2 block self-start">Or pick a variable</label>
                                <VariableSelect
                                    value=""
                                    onValueChange={(val) => { if (val) updateData({ url: `{{session.${val}}}` }); }}
                                    placeholder="Insert variable..."
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {isVariable ? (
                         <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 p-4 text-center mt-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                                <VideoIcon size={20} />
                            </div>
                            <span className="text-xs font-bold text-primary">Dynamic Video</span>
                            <span className="mt-1 text-[10px] text-muted-foreground break-all px-4">
                                Resolving from: <code className="font-mono text-primary/80">{data.url}</code>
                            </span>
                        </div>
                    ) : previewSrc ? (
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
                            <NodeFrame.Tooltip>
                                Max 1024 characters.
                            </NodeFrame.Tooltip>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.caption || ""}
                            maxLength={1024}
                            placeholder="Add a caption..."
                            onChange={(e) => updateData({ caption: e.target.value })}
                        />
                    </div>
                </div>
            }
        />
    );
}
