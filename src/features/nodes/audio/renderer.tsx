import type { NodeProps } from "@xyflow/react";
import { Music as MusicIcon, Link as LinkIcon } from "lucide-react";
import type { AudioNodeData } from "./schema";
import { MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { isDynamicVariable } from "../utils";

export function AudioNodeRenderer({ id, data, selected }: NodeProps & { data: AudioNodeData }) {
    const { setNodes } = useReactFlow();

    const isVariable = isDynamicVariable(data.url);

    const updateData = (newData: Partial<AudioNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    const getSummary = () => {
        if (!data.url) return "Upload an audio file...";
        if (isVariable) return `Dynamic: ${data.url}`;
        return data.url.split('/').pop() || "Audio File";
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<MusicIcon size={16} />}
            title="Audio"
            popoverTitle="Configure Audio"
            summary={getSummary()}
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
                            <MediaUploader onUploadSuccess={(path) => updateData({ url: path })} purpose="audio" />
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
                                    placeholder="https://example.com/audio.mp3 or {{var}}"
                                    onChange={(e) => updateData({ url: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground self-start">
                                    Use <code className="text-primary font-bold">{"{{variable_name}}"}</code> to use a dynamic audio.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {isVariable ? (
                         <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 mt-4">
                            <div className="rounded-full bg-primary/10 p-2 text-primary shrink-0 animate-pulse">
                                <MusicIcon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-primary">Dynamic Audio</p>
                                <p className="text-[9px] text-muted-foreground truncate">
                                    {data.url}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 rounded-lg border border-[var(--border-dim)] bg-background p-3 mt-4">
                            <div className="rounded-md bg-green-500/10 p-2 text-green-500 shrink-0">
                                <MusicIcon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div className="h-full w-1/3 rounded-full bg-green-500/40" />
                                </div>
                                <p className="mt-1.5 text-[9px] text-muted-foreground truncate italic">
                                    {data.url ? "Ready to play" : "No file attached"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
}
