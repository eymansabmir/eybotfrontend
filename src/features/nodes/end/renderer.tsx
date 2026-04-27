import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { StopCircle } from "lucide-react";
import type { EndNodeData } from "./schema";
import { cn } from "@/lib/utils";

export function EndNodeRenderer({ selected }: NodeProps & { data: EndNodeData }) {
    return (
        <div
            className={cn(
                "group relative flex items-center gap-3 rounded-full border bg-[var(--node-bg)] px-6 py-3 transition-all hover:shadow-lg cursor-pointer",
                selected ? "border-[var(--border-dim)] shadow-[0_0_10px_rgba(239,68,68,0.15)] ring-2 ring-destructive/20 -m-[1px]" : "border-[var(--border-dim)]"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <StopCircle size={16} />
            </div>

            <span className="text-sm font-bold tracking-tight text-foreground/80 lowercase">
                end
            </span>
        </div>
    );
}
