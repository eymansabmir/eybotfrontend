import type { ReactNode } from "react";
import { format } from "date-fns";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import type {
    CampaignEngagementAnalytics,
    EngagementTimeSeriesSeries,
} from "../../../types";
import { Skeleton } from "@/components/ui/skeleton";

const RUN_COLORS = ["#6366f1", "#f97316", "#14b8a6", "#ec4899", "#eab308", "#3b82f6"];

function formatBucket(bucket: string, granularity: "hour" | "day") {
    const d = new Date(bucket);
    return granularity === "hour"
        ? format(d, "MMM d, ha")
        : format(d, "MMM d");
}

function mergeMetricSeries(
    series: EngagementTimeSeriesSeries[],
    metric: "reads" | "replies" | "completions",
    granularity: "hour" | "day",
) {
    const buckets = new Set<string>();
    for (const s of series) {
        for (const p of s.points) buckets.add(p.bucket);
    }
    return [...buckets].sort().map((bucket) => {
        const row: Record<string, string | number> = { bucket, label: formatBucket(bucket, granularity) };
        for (const s of series) {
            const point = s.points.find((p) => p.bucket === bucket);
            row[s.label] = point?.[metric] ?? 0;
        }
        return row;
    });
}

interface CampaignEngagementPanelProps {
    data?: CampaignEngagementAnalytics;
    isLoading?: boolean;
    showRunComparison?: boolean;
}

export function CampaignEngagementPanel({
    data,
    isLoading,
    showRunComparison = true,
}: CampaignEngagementPanelProps) {
    if (isLoading || !data) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
        );
    }

    const timeSeries = data.timeSeries;
    const interactionSeries =
        data.interactions.find((series) => series.label === "All runs") ?? data.interactions[0];
    const readsData = mergeMetricSeries(timeSeries, "reads", data.granularity);
    const repliesData = mergeMetricSeries(timeSeries, "replies", data.granularity);
    const lineKeys = timeSeries.map((s) => s.label);
    const hasMultiRun = showRunComparison && timeSeries.length > 1;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DepthCard label="Avg nodes visited" value={data.flowDepth.avgNodesVisited} />
                <DepthCard label="Median nodes visited" value={data.flowDepth.medianNodesVisited} />
                <DepthCard label="Avg user interactions" value={data.flowDepth.avgUserInteractions} />
                <DepthCard label="Bot sessions" value={data.flowDepth.sessionCount} />
            </div>

            <ChartCard title="Engagement over time" subtitle="Reads, replies, and completions per period">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <MiniLineChart title="Reads" data={readsData} lineKeys={lineKeys} hasMultiRun={hasMultiRun} color="#f97316" />
                    <MiniLineChart title="Replies" data={repliesData} lineKeys={lineKeys} hasMultiRun={hasMultiRun} color="#6366f1" />
                </div>
            </ChartCard>

            <ChartCard
                title="Interaction over time"
                subtitle="Cumulative user inputs (button taps, text replies, language picks)"
            >
                {interactionSeries && interactionSeries.points.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={interactionSeries.points.map((p) => ({
                            ...p,
                            label: formatBucket(p.bucket, data.granularity),
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="cumulative" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={2} name="Cumulative interactions" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart message="No bot interactions recorded yet" />
                )}
            </ChartCard>

            <ChartCard title="Flow depth retention" subtitle="% of sessions reaching at least N nodes">
                {data.retentionCurve.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.retentionCurve}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis dataKey="depth" tick={{ fontSize: 11 }} label={{ value: "Nodes visited", position: "insideBottom", offset: -4, fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                            <Tooltip formatter={(value: number) => [`${value}%`, "Retention"]} />
                            <Area type="monotone" dataKey="percent" stroke="#a855f7" fill="#a855f7" fillOpacity={0.12} strokeWidth={2} name="Retention" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart message="No session history available yet" />
                )}
            </ChartCard>

            <ChartCard
                title="Language selection"
                subtitle={
                    data.language.topLanguage
                        ? `Most selected: ${data.language.topLanguage.label} (${data.language.topLanguage.percent}%)`
                        : "Users who reached the language node"
                }
            >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <DepthCard label="Language node reached" value={data.language.reached} />
                    <DepthCard label="Languages selected" value={data.language.selected} />
                    <DepthCard label="Selection rate" value={`${data.language.selectionRate}%`} />
                    <DepthCard
                        label="Top language"
                        value={data.language.topLanguage?.label ?? "—"}
                    />
                </div>
                {data.language.distribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data.language.distribution} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(value: number, _name, item) => [`${value} (${item.payload.percent}%)`, "Selections"]} />
                            <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Selections" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <EmptyChart message="No language selections recorded yet" />
                )}
            </ChartCard>
        </div>
    );
}

function DepthCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-black text-foreground">{value}</p>
        </div>
    );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="mb-6">
                <h3 className="text-sm font-black text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            </div>
            {children}
        </div>
    );
}

function MiniLineChart({
    title,
    data,
    lineKeys,
    hasMultiRun,
    color,
}: {
    title: string;
    data: Record<string, string | number>[];
    lineKeys: string[];
    hasMultiRun: boolean;
    color: string;
}) {
    if (data.length === 0) {
        return (
            <div>
                <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">{title}</p>
                <EmptyChart message="No data" />
            </div>
        );
    }

    return (
        <div>
            <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">{title}</p>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip />
                    {hasMultiRun && <Legend />}
                    {lineKeys.map((key, i) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={hasMultiRun ? RUN_COLORS[i % RUN_COLORS.length] : color}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

function EmptyChart({ message }: { message: string }) {
    return (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border/60 text-sm text-muted-foreground">
            {message}
        </div>
    );
}
