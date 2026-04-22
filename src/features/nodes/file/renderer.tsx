import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { FileUp, Variable } from "lucide-react";
import type { FileNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

export function FileNodeRenderer({ id, data, selected }: NodeProps & { data: FileNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<FileNodeData>) => {
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

                <div className="flex flex-col gap-2.5 w-full">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                            <FileUp size={16} />
                        </div>
                        <span className="text-sm font-semibold text-foreground leading-none pr-1 truncate">Wait for File</span>
                    </div>
                    
                    <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.message || "Enter prompt message..."}
                        </span>
                    </div>
                    <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        ➔ @{data.variableName || "variable"}
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
                            <FileUp size={14} className="text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Wait for File</span>
                        </div>
                    </div>
                    
                    <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                        {/* Prompt Message */}
                        <div className="space-y-1.5 flex flex-col">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-1">Prompt Message</label>
                            <textarea
                                className="w-full min-h-[60px] bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] resize-none transition-all"
                                value={data.message}
                                placeholder="Please upload a file..."
                                onChange={(e) => updateData({ message: e.target.value })}
                            />
                        </div>

                        {/* Variable Mapping */}
                        <div className="space-y-1.5 pt-2 border-t border-[var(--border-dim)]">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Variable size={10} className="text-muted-foreground" />
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Save File URL To</label>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">@</span>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] pl-7 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.variableName}
                                    placeholder="e.g. user_document"
                                    onChange={(e) => updateData({ variableName: e.target.value })}
                                />
                            </div>
                            <p className="text-[9px] text-muted-foreground mt-1 leading-relaxed">
                                When a file is uploaded, its URL will be saved to this variable name for use in later steps.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
