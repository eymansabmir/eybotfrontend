import type { NodeProps } from "@xyflow/react";
import { FileText as FileTextIcon, Link as LinkIcon, Type } from "lucide-react";
import type { DocumentNodeData } from "./schema";
import { MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

export function DocumentNodeRenderer({ id, data, selected }: NodeProps & { data: DocumentNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<DocumentNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<FileTextIcon size={16} />}
            title="Document"
            popoverTitle="Configure Document"
            summary={data.caption || data.filename || (data.url ? "1 attached document" : "Upload a document...")}
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
                            <MediaUploader onUploadSuccess={(path) => updateData({ url: path })} purpose="document" />
                        </TabsContent>
                        
                        <TabsContent value="url" className="pt-4 mt-0 space-y-3 outline-none">
                            <div className="space-y-1.5 flex flex-col items-center">
                                <div className="flex w-full items-center gap-1.5 mb-1">
                                    <LinkIcon size={10} className="text-muted-foreground" />
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Document URL</label>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.url || ""}
                                    placeholder="https://example.com/file.pdf"
                                    onChange={(e) => updateData({ url: e.target.value })}
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex items-center gap-3 rounded-lg border border-[var(--border-dim)] bg-background p-3 mt-4">
                        <div className="rounded-md bg-orange-500/10 p-2 text-orange-500 shrink-0">
                            <FileTextIcon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate text-foreground/80">
                                {data.filename || (data.url ? (data.url.split('/').pop() || 'document') : 'No file')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Type size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Filename (Optional)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.filename || ""}
                            placeholder="receipt.pdf"
                            onChange={(e) => updateData({ filename: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5 pt-1">
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
