import { useMemo, useState } from "react";
import { ChevronRightIcon, FlameIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NodeHeatmapResponse } from "../../../types";
import { FlowHeatmapViewer } from "./flow-heatmap-viewer";

interface CampaignFlowHeatmapPanelProps {
    heatmap?: NodeHeatmapResponse;
}

export function CampaignFlowHeatmapPanel({ heatmap }: CampaignFlowHeatmapPanelProps) {
    const [activeFlowId, setActiveFlowId] = useState<string | undefined>(heatmap?.rootFlowId);

    const activeFlow = useMemo(() => {
        if (!heatmap) return undefined;
        return heatmap.flows.find((flow) => flow.flowId === (activeFlowId ?? heatmap.rootFlowId))
            ?? heatmap.flows[0];
    }, [activeFlowId, heatmap]);

    const topNodes = useMemo(() => {
        if (!activeFlow) return [];
        return activeFlow.nodes.filter((node) => node.reachCount > 0).slice(0, 5);
    }, [activeFlow]);

    if (!heatmap || heatmap.flows.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card p-6 text-sm text-muted-foreground">
                No session history available yet. Node reach heatmap will appear once users interact with the bot flow.
            </div>
        );
    }

    const maxReach = Math.max(1, ...activeFlow!.nodes.map((node) => node.reachCount));

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <FlameIcon className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-black text-foreground">Node reach heatmap</h3>
                    </div>
                    <p className="max-w-2xl text-xs text-muted-foreground">
                        Visualizes how many sessions reached or interacted with each node across the campaign bot
                        and linked child bots. Darker highlights indicate higher reach.
                    </p>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-semibold">
                    {heatmap.sessionCount.toLocaleString()} sessions analyzed
                </Badge>
            </div>

            {heatmap.flows.length > 1 ? (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {heatmap.flows.map((flow) => (
                        <Button
                            key={flow.flowId}
                            size="sm"
                            variant={activeFlow?.flowId === flow.flowId ? "default" : "outline"}
                            className="h-8 rounded-full px-3 text-xs font-semibold"
                            onClick={() => setActiveFlowId(flow.flowId)}
                        >
                            {flow.flowName}
                            {flow.flowId === heatmap.rootFlowId ? " (root)" : ""}
                        </Button>
                    ))}
                </div>
            ) : null}

            {activeFlow ? (
                <>
                    <FlowHeatmapViewer flow={activeFlow} />

                    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Heat scale
                            </p>
                            <div className="space-y-2">
                                <div className="h-3 rounded-full bg-gradient-to-r from-slate-100 via-indigo-300 to-indigo-600" />
                                <div className="flex justify-between text-[11px] text-muted-foreground">
                                    <span>0 reached</span>
                                    <span>{maxReach.toLocaleString()} max</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                                <p>
                                    <span className="mr-2 inline-flex rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                                        N
                                    </span>
                                    Unique sessions that reached the node
                                </p>
                                <p>
                                    <span className="mr-2 inline-flex rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                        N inputs
                                    </span>
                                    User selections or replies on interactive nodes
                                </p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Top nodes in {activeFlow.flowName}
                            </p>
                            {topNodes.length > 0 ? (
                                <div className="space-y-2">
                                    {topNodes.map((node, index) => (
                                        <div
                                            key={node.nodeId}
                                            className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/70 px-3 py-2"
                                        >
                                            <div className="flex min-w-0 items-center gap-2">
                                                <span className="text-[11px] font-bold text-muted-foreground">
                                                    #{index + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-foreground">
                                                        {node.label}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">{node.nodeType}</p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-sm font-bold text-foreground">
                                                    {node.reachCount.toLocaleString()}
                                                </p>
                                                {node.interactionCount > 0 ? (
                                                    <p className="text-[11px] text-emerald-600">
                                                        {node.interactionCount} inputs
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No node reach recorded for this flow yet.</p>
                            )}

                            {activeFlow.childFlowIds.length > 0 ? (
                                <div className="mt-4 border-t border-border/50 pt-4">
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Linked child bots
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {activeFlow.childFlowIds.map((childFlowId) => {
                                            const childFlow = heatmap.flows.find((flow) => flow.flowId === childFlowId);
                                            if (!childFlow) return null;

                                            return (
                                                <Button
                                                    key={childFlowId}
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 rounded-full px-2.5 text-[11px]"
                                                    onClick={() => setActiveFlowId(childFlowId)}
                                                >
                                                    {childFlow.flowName}
                                                    <ChevronRightIcon className="ml-1 h-3 w-3" />
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
