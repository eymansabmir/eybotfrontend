import { Skeleton } from "@/components/ui/skeleton";
import type { NpsData } from "../../../types";
import { NpsScoreCircular } from "./charts/nps-score-circular";
import { NpsDistributionChart } from "./charts/nps-distribution-chart";
import { NpsTrendLineChart } from "./charts/nps-trend-line-chart";

interface NpsSectionProps {
    nps: NpsData | null;
    isLoading?: boolean;
}

export function NpsSection({ nps, isLoading }: NpsSectionProps) {
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-border bg-card p-8 animate-pulse">
                <div className="h-8 w-48 bg-muted rounded mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="flex justify-center"><Skeleton className="size-40 rounded-full" /></div>
                    <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>
                    <div className="space-y-4"><Skeleton className="h-32 w-full" /></div>
                </div>
            </div>
        );
    }

    if (!nps || nps.totalResponses === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 flex flex-col items-center justify-center text-center">
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <span className="text-2xl opacity-40">📊</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1 mt-0">No NPS Data Yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Feedback collection will begin as soon as recipients start completing the bot flow.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-tight">Net Promoter Score (NPS)</h3>
                    <p className="text-sm text-muted-foreground">Based on {nps.totalResponses.toLocaleString()} responses ({nps.responseRate.toFixed(1)}% response rate)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* 1. Circular Score (3 columns) */}
                <div className="lg:col-span-3 flex justify-center">
                    <NpsScoreCircular
                        score={nps.score}
                        promoters={nps.promoters}
                        passives={nps.passives}
                        detractors={nps.detractors}
                        total={nps.totalResponses}
                    />
                </div>

                {/* 2. Distribution (4 columns) */}
                <div className="lg:col-span-4 border-l border-border/50 pl-8 lg:pl-12">
                    <NpsDistributionChart
                        distribution={nps.distribution}
                        scale={nps.scale}
                    />
                </div>

                {/* 3. Trend (5 columns) */}
                <div className="lg:col-span-5 border-l border-border/50 pl-8 lg:pl-12">
                    <NpsTrendLineChart
                        trend={nps.trend}
                    />
                </div>
            </div>

            {/* Bottom Legend / Breakdown */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
                <BreakdownItem
                    label="Promoters"
                    count={nps.promoters}
                    total={nps.totalResponses}
                    color="#22c55e"
                    range={`≥${Math.ceil(nps.scale.max * 0.8)}`}
                />
                <BreakdownItem
                    label="Passives"
                    count={nps.passives}
                    total={nps.totalResponses}
                    color="#eab308"
                    range={`${Math.ceil(nps.scale.max * 0.5)} - ${Math.ceil(nps.scale.max * 0.8) - 1}`}
                />
                <BreakdownItem
                    label="Detractors"
                    count={nps.detractors}
                    total={nps.totalResponses}
                    color="#ef4444"
                    range={`<${Math.ceil(nps.scale.max * 0.5)}`}
                />
            </div>
        </div>
    );
}

function BreakdownItem({ label, count, total, color, range }: { label: string; count: number; total: number; color: string; range: string }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
                <div className="size-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                <span className="text-[10px] text-muted-foreground/40 font-medium">{range}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold tabular-nums text-foreground">{count.toLocaleString()}</span>
                <span className="text-xs font-medium text-muted-foreground/60">{pct.toFixed(1)}%</span>
            </div>
        </div>
    );
}
