import type { z } from "zod";
import type { ReactNode } from "react";
import type { NodeProps } from "@xyflow/react";

export interface NodeConfig {
    type: string;
    label: string;
    icon: ReactNode;
    category: "messaging" | "logic" | "flow_control" | "integration";
    description?: string;
}

export interface NodeDefinition<TData extends Record<string, any> = any> {
    config: NodeConfig;
    schema: z.ZodSchema<TData>;
    renderer: React.ComponentType<NodeProps & { data: TData }>;
    handler: (data: TData) => Promise<any>;
    /** Initial data placed in node.data when dropped onto the canvas */
    defaultData: TData;
    /** Initial branches placed on the node when dropped onto the canvas */
    defaultBranches: Array<{ key: string; label: string }>;
}
