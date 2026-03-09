import { useMemo } from "react";

interface NpsTrendLineChartProps {
    trend: Array<{ date: string; score: number; responses: number }>;
}

export function NpsTrendLineChart({ trend }: NpsTrendLineChartProps) {
    const width = 400;
    const height = 120;
    const padding = 20;

    const points = useMemo(() => {
        if (trend.length === 0) return "";
        if (trend.length === 1) {
            const y = height - padding - ((trend[0].score + 100) / 200) * (height - 2 * padding);
            return `M ${padding} ${y} L ${width - padding} ${y}`;
        }

        return trend.map((d, i) => {
            const x = padding + (i / (trend.length - 1)) * (width - 2 * padding);
            // Map NPS score (-100 to 100) to height
            const y = height - padding - ((d.score + 100) / 200) * (height - 2 * padding);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(" ");
    }, [trend, width, height, padding]);

    const areaPoints = useMemo(() => {
        if (trend.length < 2) return "";
        const p = trend.map((d, i) => {
            const x = padding + (i / (trend.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((d.score + 100) / 200) * (height - 2 * padding);
            return `${x} ${y}`;
        });
        return `M ${padding} ${height - padding} ${p.join(" L ")} L ${width - padding} ${height - padding} Z`;
    }, [trend, width, height, padding]);

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">NPS Trend Over Time</h4>
            </div>

            <div className="relative h-[140px] w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                    {/* Grid lines */}
                    <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="currentColor" className="text-muted/20" strokeDasharray="4 4" />
                    <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="currentColor" className="text-muted/30" />
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="currentColor" className="text-muted/20" strokeDasharray="4 4" />

                    {/* Area under line */}
                    <path
                        d={areaPoints}
                        fill="url(#trendGradient)"
                        className="opacity-20"
                    />

                    {/* Actual line */}
                    <path
                        d={points}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="drop-shadow-[0_4px_6px_rgba(99,102,241,0.3)]"
                    />

                    {/* Data Points */}
                    {trend.map((d, i) => {
                        const x = padding + (i / (trend.length - 1)) * (width - 2 * padding);
                        const y = height - padding - ((d.score + 100) / 200) * (height - 2 * padding);
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="4"
                                className="fill-indigo-600 stroke-background stroke-2 transition-all hover:r-6 cursor-help"
                            />
                        );
                    })}

                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between mt-2 px-[10px]">
                    {trend.map((d, i) => {
                        if (trend.length > 5 && i % Math.floor(trend.length / 5) !== 0 && i !== trend.length - 1) return null;
                        return (
                            <span key={i} className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
