import type { Node, Edge } from '@xyflow/react';
import { MarkerType } from '@xyflow/react';
import { NodeType } from './node-types.constants';

export const DEFAULT_NODES: Node[] = [
    {
        id: "start_node",
        type: NodeType.START,
        position: { x: 400, y: 50 },
        data: { label: "Start" },
        deletable: false,
    },
    {
        id: "welcome_text",
        type: NodeType.SEND_TEXT,
        position: { x: 400, y: 200 },
        data: { message: "Welcome to our WhatsApp Bot! 🚀\n\nHow can we help you today?", variables: [] },
    },
    {
        id: "end_node",
        type: NodeType.END,
        position: { x: 400, y: 400 },
        data: { label: "End" },
        deletable: false,
    },
];

export const DEFAULT_EDGES: Edge[] = [
    { 
        id: "e-start-welcome", 
        source: "start_node", 
        target: "welcome_text",
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 }
    },
    { 
        id: "e-welcome-end", 
        source: "welcome_text", 
        target: "end_node",
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12 }
    },
];
