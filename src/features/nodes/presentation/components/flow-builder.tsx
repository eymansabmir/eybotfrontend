import React, { useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import {
    ReactFlow,
    Background,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    Panel,
    BackgroundVariant,
} from "@xyflow/react";
import type {
    Connection,
    Edge,
    Node,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes, getNodeDefinition } from "../../registry";
import { NodePalette } from "./node-palette";

const defaultNodes: Node[] = [
    {
        id: "start_node",
        type: "start",
        position: { x: 400, y: 50 },
        data: {},
        deletable: false,
    },
    {
        id: "welcome_text",
        type: "send_text",
        position: { x: 300, y: 150 },
        data: { message: "Welcome!", variables: [] },
    },
    {
        id: "end_node",
        type: "end",
        position: { x: 400, y: 400 },
        data: {},
        deletable: false,
    },
];

const defaultEdges: Edge[] = [
    { id: "e-start-welcome", source: "start_node", target: "welcome_text" },
    { id: "e-welcome-end", source: "welcome_text", target: "end_node" },
];

let idIncrement = 0;
const getId = () => `node_${Date.now()}_${idIncrement++}`;

interface FlowBuilderProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    isTranslationMode?: boolean;
    onNodesChangeExternal?: (nodes: Node[]) => void;
    onEdgesChangeExternal?: (edges: Edge[]) => void;
}

export interface FlowBuilderRef {
    getFlowState: () => { nodes: Node[]; edges: Edge[] };
}

const FlowBuilderContent = forwardRef<FlowBuilderRef, FlowBuilderProps>(({
    initialNodes,
    initialEdges,
    isTranslationMode = false
}, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = React.useState<Node[]>(initialNodes || defaultNodes);
    const [edges, setEdges] = React.useState<Edge[]>(initialEdges || defaultEdges);
    const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

    useImperativeHandle(ref, () => ({
        getFlowState: () => ({
            nodes: getNodes(),
            edges: getEdges()
        })
    }));

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        []
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection) => {
            setEdges((eds) => addEdge(params, eds));
        },
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        if (isTranslationMode) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, [isTranslationMode]);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            if (isTranslationMode) return;
            event.preventDefault();

            const type = event.dataTransfer.getData("application/reactflow");

            if (typeof type === "undefined" || !type) {
                return;
            }

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const definition = getNodeDefinition(type);
            let defaultData: Record<string, any> = definition?.defaultData ?? {};
            let defaultBranches: Array<{ key: string; label: string }> = definition?.defaultBranches ?? [{ key: "default", label: "Default" }];

            // send_buttons: generate fresh unique button IDs at drop time
            if (type === "send_buttons") {
                const buttonId = `btn_${Date.now()}`;
                defaultData = {
                    body: "",
                    buttons: [{ id: buttonId, title: "Button 1" }],
                    interaction: {
                        mode: "input",
                        input: {
                            type: "choice",
                            timeoutSeconds: 3600,
                            options: [{ id: buttonId, label: "Button 1", branchKey: buttonId }],
                        },
                    },
                };
                defaultBranches = [
                    { key: buttonId, label: "Button 1" },
                    { key: "timeout", label: "Timeout" },
                ];
            }

            const newNode: Node = {
                id: getId(),
                type,
                position,
                data: { 
                    ...defaultData, 
                    branches: defaultBranches,
                    label: definition?.config.label || type
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition, isTranslationMode]
    );

    return (
        <div className="h-full w-full bg-muted/10 flex-1 overflow-hidden" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes as any}
                nodesDraggable={!isTranslationMode}
                nodesConnectable={!isTranslationMode}
                elementsSelectable={true}
                fitView
            >
                <Background color="#cbd5e1" gap={20} variant={BackgroundVariant.Dots} />
                {!isTranslationMode && (
                    <Panel position="top-left" className="ml-4 mt-4">
                        <NodePalette />
                    </Panel>
                )}
            </ReactFlow>
        </div>
    );
});

// Wrap in Provider to access hooks
export const FlowBuilder = forwardRef<FlowBuilderRef, Omit<FlowBuilderProps, 'onNodesChangeExternal' | 'onEdgesChangeExternal'>>((props, ref) => {
    return (
        <ReactFlowProvider>
            <FlowBuilderContent {...props} ref={ref} />
        </ReactFlowProvider>
    );
});
