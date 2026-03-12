import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface NpsDistributionChartProps {
    distribution: Record<string, number>;
    scale: { min: number; max: number };
}

export function NpsDistributionChart({ distribution, scale }: NpsDistributionChartProps) {
    const { min, max } = scale;
    const scores = useMemo(() => {
        const arr = [];
        for (let i = min; i <= max; i++) {
            arr.push({ score: i, count: distribution[i.toString()] || 0 });
        }
        return arr;
    }, [distribution, min, max]);

    const maxCount = useMemo(() => Math.max(...scores.map(s => s.count), 1), [scores]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Score Distribution</h4>
                <span className="text-[10px] font-medium text-muted-foreground/40 uppercase">Scale: {min}-{max}</span>
            </div>

            <div className="flex items-end gap-1.5 h-32 w-full px-2">
                {scores.map((s) => {
                    const heightPct = (s.count / maxCount) * 100;
                    const isPromoter = s.score >= Math.ceil(max * 0.8);
                    const isPassive = s.score >= Math.ceil(max * 0.5) && !isPromoter;
                    const color = isPromoter ? "bg-green-500" : isPassive ? "bg-yellow-500" : "bg-red-500";
                    const glow = isPromoter ? "shadow-[0_0_8px_rgba(34,197,94,0.3)]" : isPassive ? "shadow-[0_0_8px_rgba(234,179,8,0.3)]" : "shadow-[0_0_8px_rgba(239,68,68,0.3)]";

                    return (
                        <div key={s.score} className="group relative flex-1 flex flex-col items-center gap-2">
                            {/* Tooltip on hover */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border px-2 py-0.5 rounded text-[10px] font-bold z-20 pointer-events-none whitespace-nowrap shadow-sm">
                                {s.count} responses
                            </div>

                            <div className="w-full relative min-h-[4px]" style={{ height: `${Math.max(heightPct, 4)}%` }}>
                                <div
                                    className={cn(
                                        "absolute inset-0 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-110",
                                        color,
                                        s.count > 0 && glow
                                    )}
                                />
                            </div>
                            <span className={cn(
                                "text-[9px] font-bold tabular-nums transition-colors",
                                s.count > 0 ? "text-foreground" : "text-muted-foreground/30"
                            )}>
                                {s.score}
                            </span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
