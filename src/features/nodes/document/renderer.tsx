import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { FileText as FileTextIcon, Link as LinkIcon, Type } from "lucide-react";
import type { DocumentNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { MediaUploader } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

                <div className="flex flex-col gap-2.5 w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                            <FileTextIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-none pr-1 truncate">Document</span>
                    </div>
                    
                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.caption || data.filename || (data.url ? "1 attached document" : "Upload a document...")}
                        </span>
                    </div>
                </div>

                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                />
            </div>

            {/* 2) Popover Configuration Panel */}
            {selected && (
                <div 
                    className="absolute top-0 left-[230px] w-[340px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
                >
                    <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                        <div className="flex items-center gap-2">
                            <FileTextIcon size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Document</span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
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
                </div>
            )}
        </div>
    );
}
