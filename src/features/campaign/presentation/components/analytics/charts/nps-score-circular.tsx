import { useMemo } from "react";

interface NpsScoreCircularProps {
    score: number | null;
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
}

export function NpsScoreCircular({ score, promoters, passives, detractors, total }: NpsScoreCircularProps) {
    const r = 70;
    const stroke = 12;
    const center = 80;
    const circumference = 2 * Math.PI * r;

    const segments = useMemo(() => {
        if (total === 0) return [];

        let currentOffset = -90; // Start at top

        return [
            { label: "Promoters", value: promoters, color: "#22c55e" },
            { label: "Passives", value: passives, color: "#eab308" },
            { label: "Detractors", value: detractors, color: "#ef4444" },
        ].map(seg => {
            const percentage = seg.value / total;
            const angle = percentage * 360;
            const res = {
                ...seg,
                offset: currentOffset,
                dashArray: `${(percentage * circumference)} ${circumference}`,
                dashOffset: -(currentOffset / 360) * circumference,
            };
            currentOffset += angle;
            return res;
        });
    }, [total, promoters, passives, detractors, circumference]);

    const scoreColor = score === null ? "#94a3b8" : score >= 50 ? "#22c55e" : score >= 0 ? "#eab308" : "#ef4444";
    const scoreLabel = score === null ? "N/A" : score >= 50 ? "Excellent" : score >= 0 ? "Good" : "Needs Review";

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-sm">
                {/* Background track */}
                <circle
                    cx={center}
                    cy={center}
                    r={r}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={stroke}
                />

                {/* Segments */}
                {segments.map((seg, i) => (
                    <circle
                        key={i}
                        cx={center}
                        cy={center}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={stroke}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                        style={{
                            transform: `rotate(${seg.offset}deg)`,
                            transformOrigin: "center",
                            transition: 'stroke-dasharray 1s ease-out, stroke-dashoffset 1s ease-out, transform 1s ease-out',
                        }}
                    />
                ))}

                {/* Inner shadow/border for premium feel */}
                <circle
                    cx={center}
                    cy={center}
                    r={r - stroke / 2}
                    fill="none"
                    stroke="rgba(0,0,0,0.02)"
                    strokeWidth="1"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Net Promoter</span>
                <span className="text-4xl font-black tabular-nums transition-colors duration-500" style={{ color: scoreColor }}>
                    {score !== null ? (score >= 0 ? `+${score}` : score) : "—"}
                </span>
                <div className="mt-1 flex items-center gap-1.5">
                    <div className="size-1.5 rounded-full" style={{ backgroundColor: scoreColor }} />
                    <span className="text-[11px] font-bold uppercase tracking-tight" style={{ color: scoreColor }}>
                        {scoreLabel}
                    </span>
                </div>
            </div>
        </div>
    );
}
