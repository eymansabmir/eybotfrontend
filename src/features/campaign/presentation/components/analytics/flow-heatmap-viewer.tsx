import { useMemo, type ComponentType } from "react";
import {
    Background,
    BackgroundVariant,
    Controls,
    MarkerType,
    ReactFlow,
    ReactFlowProvider,
    type Edge,
    type Node,
    type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes as baseNodeTypes } from "@/features/nodes/registry";
import type { FlowHeatmapGraph, NodeHeatmapStat } from "../../../types";

const HEAT_COLOR = "rgba(99, 102, 241";

function heatColor(reachCount: number, maxReach: number): string | undefined {
    if (reachCount <= 0 || maxReach <= 0) return undefined;
    const ratio = reachCount / maxReach;
    const opacity = 0.18 + ratio * 0.55;
    return `${HEAT_COLOR}, ${opacity})`;
}

function mapGraphNodeToFrontend(
    node: FlowHeatmapGraph["graphNodes"][number],
    stat?: NodeHeatmapStat,
    maxReach = 1,
): Node {
    return {
        id: node.id,
        type: node.type,
        position: node.position,
        draggable: false,
        selectable: true,
        data: {
            ...node.data,
            label: node.label,
            branches: node.branches ?? [],
            readOnly: true,
            reachCount: stat?.reachCount ?? 0,
            interactionCount: stat?.interactionCount ?? 0,
            totalHits: stat?.totalHits ?? 0,
            heatColor: heatColor(stat?.reachCount ?? 0, maxReach),
        },
    };
}

function mapGraphEdgeToFrontend(edge: FlowHeatmapGraph["graphEdges"][number]): Edge {
    return {
        id: edge.id,
        source: edge.sourceNodeId,
        sourceHandle: edge.sourceBranchKey === "default" ? undefined : edge.sourceBranchKey,
        target: edge.targetNodeId,
        selectable: false,
        focusable: false,
    };
}

function HeatmapNodeWrapper(props: NodeProps) {
    const Component = (baseNodeTypes as Record<string, ComponentType<NodeProps>>)[props.type ?? ""];
    if (!Component) {
        return (
            <div className="rounded-xl border border-dashed border-border px-3 py-2 text-xs">
                {props.type}
            </div>
        );
    }

    const reachCount = Number(props.data.reachCount ?? 0);
    const interactionCount = Number(props.data.interactionCount ?? 0);
    const heat = props.data.heatColor as string | undefined;

    return (
        <div
            className="relative rounded-2xl transition-shadow"
            style={{
                backgroundColor: heat,
                boxShadow: heat ? `0 0 0 2px rgba(99, 102, 241, 0.35)` : undefined,
            }}
        >
            <Component {...props} />
            {reachCount > 0 ? (
                <div className="absolute -right-2 -top-2 z-20 flex flex-col items-end gap-1">
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-md">
                        {reachCount.toLocaleString()}
                    </span>
                    {interactionCount > 0 ? (
                        <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
                            {interactionCount} inputs
                        </span>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function createHeatmapNodeTypes() {
    const wrapped: Record<string, ComponentType<NodeProps>> = {};

    for (const key of Object.keys(baseNodeTypes)) {
        wrapped[key] = (props: NodeProps) => <HeatmapNodeWrapper {...props} />;
    }

    return wrapped;
}

interface FlowHeatmapViewerProps {
    flow: FlowHeatmapGraph;
}

function FlowHeatmapViewerContent({ flow }: FlowHeatmapViewerProps) {
    const statsByNodeId = useMemo(
        () => new Map(flow.nodes.map((node) => [node.nodeId, node])),
        [flow.nodes],
    );
    const maxReach = useMemo(
        () => Math.max(1, ...flow.nodes.map((node) => node.reachCount)),
        [flow.nodes],
    );

    const nodes = useMemo(
        () => flow.graphNodes.map((node) => mapGraphNodeToFrontend(node, statsByNodeId.get(node.id), maxReach)),
        [flow.graphNodes, statsByNodeId, maxReach],
    );
    const edges = useMemo(
        () => flow.graphEdges.map(mapGraphEdgeToFrontend),
        [flow.graphEdges],
    );
    const heatmapNodeTypes = useMemo(() => createHeatmapNodeTypes(), []);

    return (
        <div className="h-[560px] w-full overflow-hidden rounded-xl border border-border/60 bg-[var(--canvas-bg)]">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={heatmapNodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnScroll
                zoomOnScroll
                fitView
                fitViewOptions={{ maxZoom: 0.85, padding: 0.35 }}
                defaultEdgeOptions={{
                    type: "smoothstep",
                    selectable: false,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 12,
                        height: 12,
                    },
                    style: { strokeWidth: 2 },
                }}
            >
                <Background color="var(--canvas-dot)" gap={20} size={2} variant={BackgroundVariant.Dots} />
                <Controls position="top-right" showInteractive={false} />
            </ReactFlow>
        </div>
    );
}

export function FlowHeatmapViewer(props: FlowHeatmapViewerProps) {
    return (
        <ReactFlowProvider>
            <FlowHeatmapViewerContent {...props} />
        </ReactFlowProvider>
    );
}

export { heatColor };
