import React from "react";
import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Trash } from "lucide-react";

export function withUniversalDelete(Renderer: React.ComponentType<any>, type: string) {
    return function WrappedNode(props: NodeProps) {
        const { setNodes, setEdges } = useReactFlow();
        const isStartOrEnd = type === "start" || type === "end";

        return (
            <div className="relative group/universal-node">
                <Renderer {...props} />
                {!isStartOrEnd && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setNodes((nds) => nds.filter((n) => n.id !== props.id));
                            setEdges((eds) => eds.filter((edge) => edge.source !== props.id && edge.target !== props.id));
                        }}
                        className="absolute top-2.5 right-2.5 z-50 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover/universal-node:opacity-100 transition-all cursor-pointer"
                        title="Delete Node"
                    >
                        <Trash size={14} />
                    </button>
                )}
            </div>
        );
    };
}
