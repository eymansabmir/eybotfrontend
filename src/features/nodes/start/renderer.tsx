import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { PlayCircle } from "lucide-react";
import type { StartNodeData } from "./schema";
import { cn } from "@/lib/utils";

export function StartNodeRenderer({ selected }: NodeProps & { data: StartNodeData }) {
    return (
        <div
            className={cn(
                "group relative flex items-center gap-3 rounded-full border bg-card px-6 py-3 transition-all hover:shadow-lg",
                selected ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border"
            )}
        >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <PlayCircle size={16} />
            </div>

            <span className="text-sm font-bold tracking-tight text-foreground/80 lowercase">
                start
            </span>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />

            {/* Animated pulse effect */}
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse -z-10" />
        </div>
    );
}
