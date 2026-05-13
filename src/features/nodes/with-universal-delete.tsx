import React from "react";
import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Trash } from "lucide-react";
import { createContext, useContext } from "react";

interface NodeContextType {
    id: string;
    data: any;
    type: string;
}

const NodeContext = createContext<NodeContextType | null>(null);

export const useNodeContext = () => useContext(NodeContext);

export function withUniversalDelete(Renderer: React.ComponentType<any>, type: string) {
    return function WrappedNode(props: NodeProps) {
        const { setNodes, setEdges } = useReactFlow();
        const isStartOrEnd = type === "start" || type === "end";

        return (
            <NodeContext.Provider value={{ id: props.id, data: props.data, type }}>
                <div className="relative group/universal-node">
                    <Renderer {...props} />
                    {!isStartOrEnd && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setNodes((nds) => nds.filter((n) => n.id !== props.id));
                                setEdges((eds) => eds.filter((edge) => edge.source !== props.id && edge.target !== props.id));
                            }}
                            className="absolute top-2.5 right-2.5 z-50 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover/universal-node:opacity-100 group-has-[[data-is-editing=true]]/universal-node:hidden transition-all cursor-pointer"
                            title="Delete Node"
                        >
                            <Trash size={14} />
                        </button>
                    )}
                </div>
            </NodeContext.Provider>
        );
    };
}
