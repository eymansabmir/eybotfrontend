import type { NodeProps } from "@xyflow/react";
import { Image as ImageIcon, Type } from "lucide-react";
import type { ImageNodeData } from "./schema";
import { imageNode } from "./index";
import { useResolveUrl, MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { validateMediaUrl, validateMediaUrlRemote } from "@/lib/storage/application/validation";
import { useEffect } from "react";

export function ImageNodeRenderer({ id, data, selected }: NodeProps & { data: ImageNodeData }) {
    const { setNodes } = useReactFlow();
    const isVariable = !!data.url && data.url.includes("{{") && data.url.includes("}}");
    const { data: previewSrc } = useResolveUrl(isVariable ? undefined : data.url, "public");

    // Remote validation for external URLs (checks size/availability)
    useEffect(() => {
        if (!data.url || data.validationError || !data.url.startsWith("http")) return;
        
        const timer = setTimeout(async () => {
            const result = await validateMediaUrlRemote(data.url, "image");
            if (!result.isValid) {
                updateData({ validationError: result.error || "Size limit exceeded" });
            }
        }, 800);
        
        return () => clearTimeout(timer);
    }, [data.url]);

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

    const getSummary = () => {
        if (!data.url) return "Click to configure image...";
        if (isVariable) return `Dynamic: ${data.url}`;
        return "1 file attached";
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<ImageIcon size={16} />}
            title="Image"
            popoverTitle="Configure Image"
            description={imageNode.config.description}
            summary={getSummary()}
            showPopover={selected}
            error={data.validationError}
            popoverBody={
                <div className="space-y-5">
                    {/* Segmented Control for Upload vs URL */}
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
                            <MediaUploader onUploadSuccess={(path) => updateData({ url: path, validationError: undefined })} purpose="image" />
                        </TabsContent>
                        
                        <TabsContent value="url" className="pt-4 mt-0 space-y-3 outline-none">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                    Source URL or Variable
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.url || ""}
                                    placeholder="https://example.com/image.jpg or {{var}}"
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const validation = validateMediaUrl(val, "image");
                                        updateData({ 
                                            url: val, 
                                            validationError: validation.isValid ? undefined : (validation.error || "Invalid Image")
                                        });
                                    }}
                                />
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-2 block">Or pick a variable</label>
                                <VariableSelect
                                    value={isVariable ? "" : ""}
                                    onValueChange={(val) => { if (val) updateData({ url: `{{session.${val}}}` }); }}
                                    placeholder="Insert variable..."
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Preview */}
                    {isVariable ? (
                        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                                <ImageIcon size={20} />
                            </div>
                            <span className="text-xs font-bold text-primary">Dynamic Resource</span>
                            <span className="mt-1 text-[10px] text-muted-foreground break-all px-4">
                                Resolving from: <code className="font-mono text-primary/80">{data.url}</code>
                            </span>
                        </div>
                    ) : previewSrc ? (
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
                        <div className="flex items-center gap-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                <Type size={10} /> Caption (Optional)
                            </label>
                            <NodeFrame.Tooltip>
                                Max 1024 characters.
                            </NodeFrame.Tooltip>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
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
