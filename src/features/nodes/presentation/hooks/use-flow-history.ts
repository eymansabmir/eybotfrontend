import { useState, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

interface HistoryState {
    nodes: Node[];
    edges: Edge[];
}

const MAX_HISTORY = 50;

export function useFlowHistory(
    nodes: Node[],
    edges: Edge[],
    setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void,
    setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void
) {
    const [past, setPast] = useState<HistoryState[]>([]);
    const [future, setFuture] = useState<HistoryState[]>([]);
    
    // Use a ref to track the last saved state to avoid redundant snapshots
    const lastStateRef = useRef<HistoryState>({ nodes, edges });

    const takeSnapshot = useCallback(() => {
        // Simple comparison to avoid unnecessary snapshots
        if (
            JSON.stringify(lastStateRef.current.nodes) === JSON.stringify(nodes) &&
            JSON.stringify(lastStateRef.current.edges) === JSON.stringify(edges)
        ) {
            return;
        }

        const newState = { nodes: [...nodes], edges: [...edges] };
        setPast(prev => [...prev.slice(-(MAX_HISTORY - 1)), lastStateRef.current]);
        setFuture([]);
        lastStateRef.current = newState;
    }, [nodes, edges]);

    const undo = useCallback(() => {
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture(prev => [lastStateRef.current, ...prev.slice(0, MAX_HISTORY - 1)]);
        setPast(newPast);

        setNodes(previous.nodes);
        setEdges(previous.edges);
        lastStateRef.current = previous;
    }, [past, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast(prev => [...prev.slice(-(MAX_HISTORY - 1)), lastStateRef.current]);
        setFuture(newFuture);

        setNodes(next.nodes);
        setEdges(next.edges);
        lastStateRef.current = next;
    }, [future, setNodes, setEdges]);

    return { undo, redo, takeSnapshot, canUndo: past.length > 0, canRedo: future.length > 0 };
}
