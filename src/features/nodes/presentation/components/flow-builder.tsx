import React, { useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    Panel,
    BackgroundVariant,
    MarkerType,
    ConnectionLineType,
    ControlButton,
} from "@xyflow/react";
import { Braces } from "lucide-react";
import { VariablesDrawer } from "@/features/variables/components/variables-drawer";
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

import { useFlowHistory } from "../hooks/use-flow-history";

import { DEFAULT_NODES, DEFAULT_EDGES } from "../../defaults";

let idIncrement = 0;
const getId = () => `node_${Date.now()}_${idIncrement++}`;

interface FlowBuilderProps {
    initialNodes?: Node[];
    initialEdges?: Edge[];
    isTranslationMode?: boolean;
    onNodesChange?: (nodes: Node[]) => void;
    onEdgesChangeExternal?: (edges: Edge[]) => void;
    onFlowChange?: (payload: { nodes: Node[]; edges: Edge[] }) => void;
}

export interface FlowBuilderRef {
    getFlowState: () => { nodes: Node[]; edges: Edge[] };
    setFlowState: (nodes: Node[], edges: Edge[]) => void;
}

const FlowBuilderContent = forwardRef<FlowBuilderRef, FlowBuilderProps>(({
    initialNodes,
    initialEdges,
    isTranslationMode = false,
    onFlowChange,
    onNodesChange: onNodesChangeProp
}, ref) => {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = React.useState<Node[]>(initialNodes && initialNodes.length > 0 ? initialNodes : DEFAULT_NODES);
    const [edges, setEdges] = React.useState<Edge[]>(initialEdges && initialEdges.length > 0 ? initialEdges : DEFAULT_EDGES);
    const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();
    const hasMountedRef = useRef(false);
    const [variablesDrawerOpen, setVariablesDrawerOpen] = React.useState(false);

    const { undo, redo, takeSnapshot } = useFlowHistory(nodes, edges, setNodes, setEdges);
    
    const handleVariableDelete = useCallback((variableName: string) => {
        takeSnapshot();
        
        const escaped = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const templateRegex = new RegExp(`\\{\\{\\s*(?:(?:session|contact)\\.)?${escaped}\\s*\\}\\}`, 'g');

        const cleanObj = (obj: any): any => {
            if (!obj) return obj;
            if (typeof obj === 'string') {
                return obj.replace(templateRegex, '');
            }
            if (Array.isArray(obj)) {
                return obj.map(cleanObj);
            }
            if (typeof obj === 'object') {
                const next = { ...obj };
                Object.keys(next).forEach(key => {
                    if ((key === 'variable' || key === 'variableName') && next[key] === variableName) {
                        next[key] = "";
                    } else {
                        next[key] = cleanObj(next[key]);
                    }
                });
                return next;
            }
            return obj;
        };

        setNodes((nds) => nds.map((node) => ({
            ...node,
            data: cleanObj(node.data)
        })));
    }, [setNodes, takeSnapshot]);

    const duplicateSelectedNodes = useCallback(() => {
        const selectedNodes = getNodes().filter((n) => n.selected);
        if (selectedNodes.length === 0) return;

        takeSnapshot();

        const newNodes = selectedNodes.map((node) => ({
            ...node,
            id: getId(),
            position: { x: node.position.x + 40, y: node.position.y + 40 },
            selected: true,
            data: JSON.parse(JSON.stringify(node.data)),
        }));

        setNodes((nds) => 
            nds.map((n) => ({ ...n, selected: false }))
               .concat(newNodes)
        );
    }, [getNodes, takeSnapshot]);

    useImperativeHandle(ref, () => ({
        getFlowState: () => ({
            nodes: getNodes(),
            edges: getEdges()
        }),
        setFlowState: (newNodes: Node[], newEdges: Edge[]) => {
            setNodes(newNodes);
            setEdges(newEdges);
        }
    }));

    const lastNotifiedSnapshotRef = useRef<string>("");

    // Notify parent of changes only when "semantic" content or layout changes are finalized.
    // We ignore transient states like 'selected' or 'dragging' and avoid triggering during an active drag.
    React.useEffect(() => {
        const isDragging = nodes.some(n => n.dragging);
        if (isDragging) return;

        // Create a stable snapshot for change detection.
        // We omit 'position' here to prevent movement from triggering re-renders in the parent
        // or unnecessary dirty-check calculations.
        const currentSnapshot = JSON.stringify({
            nodes: nodes.map(n => ({ 
                id: n.id, 
                type: n.type, 
                data: n.data 
            })).sort((a, b) => a.id.localeCompare(b.id)),
            edges: edges.map(e => ({ 
                id: e.id, 
                source: e.source, 
                target: e.target,
                sourceHandle: e.sourceHandle || "default",
                targetHandle: e.targetHandle || "default"
            })).sort((a, b) => a.id.localeCompare(b.id))
        });

        if (currentSnapshot !== lastNotifiedSnapshotRef.current) {
            lastNotifiedSnapshotRef.current = currentSnapshot;
            
            // We NO LONGER return here on mount, so the parent can set its initial baseline snapshot.
            if (!hasMountedRef.current) {
                hasMountedRef.current = true;
            }
            
            onFlowChange?.({ nodes, edges });
        }
    }, [nodes, edges, onFlowChange]);

    // Notify parent of ALL node data changes (including direct setNodes calls from renderers).
    // onNodesChange only fires for ReactFlow structural events (move/select/delete),
    // NOT for programmatic setNodes calls. This effect bridges that gap.
    React.useEffect(() => {
        onNodesChangeProp?.(nodes);
    }, [nodes, onNodesChangeProp]);

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isCtrl = e.ctrlKey || e.metaKey;
            
            if (isCtrl && e.key === "z") {
                e.preventDefault();
                undo();
            } else if (isCtrl && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
                e.preventDefault();
                redo();
            } else if (isCtrl && e.key === "d") {
                e.preventDefault();
                duplicateSelectedNodes();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo, duplicateSelectedNodes]);

    // Variables are now managed explicitly via VariableSelect component
    // or through the Variable Manager node. No more automatic scraping
    // from node data to prevent "pollution" during typing.

    const onNodesChange: OnNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => {
                const nextNodes = applyNodeChanges(changes, nds);
                onNodesChangeProp?.(nextNodes);
                return nextNodes;
            });
        },
        [onNodesChangeProp]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        []
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection) => {
            takeSnapshot();
            setEdges((eds) => addEdge(params, eds));
        },
        [takeSnapshot]
    );

    const onNodesDelete = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const onEdgesDelete = useCallback(() => {
        takeSnapshot();
    }, [takeSnapshot]);

    const onNodeDragStop = useCallback(() => {
        takeSnapshot();
        // Force a notification on drag stop to ensure parent has latest positions, 
        // even though positions don't trigger the 'dirty' status.
        onFlowChange?.({ nodes, edges });
    }, [takeSnapshot, onFlowChange, nodes, edges]);

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

            setNodes((nds) => {
                const nextNodes = nds.concat(newNode);
                onNodesChangeProp?.(nextNodes);
                return nextNodes;
            });
            takeSnapshot();
        },
        [screenToFlowPosition, isTranslationMode, getNodes, takeSnapshot, onNodesChangeProp]
    );

    return (
        <div className="h-full w-full bg-[var(--canvas-bg)] flex-1 overflow-hidden" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodesDelete={onNodesDelete}
                onEdgesDelete={onEdgesDelete}
                onNodeDragStop={onNodeDragStop}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes as any}
                nodesDraggable={!isTranslationMode}
                nodesConnectable={!isTranslationMode}
                elementsSelectable={true}
                connectionLineType={ConnectionLineType.SmoothStep}
                connectionLineStyle={{ strokeWidth: 2 }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    pathOptions: { borderRadius: 20 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 12,
                        height: 12,
                    },
                    style: {
                        strokeWidth: 2,
                    }
                } as any}
                fitView
                fitViewOptions={{ maxZoom: 0.8, padding: 0.5 }}
            >
                <Background color="var(--canvas-dot)" gap={20} size={2} variant={BackgroundVariant.Dots} />
                <Controls position="top-right" className="mr-4 mt-4">
                    <ControlButton 
                        onClick={() => setVariablesDrawerOpen(true)}
                        title="Variable Manager"
                    >
                        <Braces className="size-4" />
                    </ControlButton>
                </Controls>
                {!isTranslationMode && (
                    <Panel position="top-left" className="ml-4 mt-4">
                        <NodePalette />
                    </Panel>
                )}
            </ReactFlow>

            <VariablesDrawer 
                open={variablesDrawerOpen} 
                onOpenChange={setVariablesDrawerOpen} 
                onDelete={handleVariableDelete}
            />
        </div>
    );
});

// Wrap in Provider to access hooks
export const FlowBuilder = forwardRef<FlowBuilderRef, FlowBuilderProps>((props, ref) => {
    return (
        <ReactFlowProvider>
            <FlowBuilderContent {...props} ref={ref} />
        </ReactFlowProvider>
    );
});
