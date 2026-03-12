import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: number;
    total: number;
    icon: LucideIcon;
    color: string;
    description: string;
    className?: string;
}

export function MetricCard({ title, value, total, icon: Icon, color, description, className }: MetricCardProps) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-muted-foreground/20",
            className
        )}>
            {/* Background Icon Glow */}
            <div className="absolute -right-4 -top-4 opacity-[0.03] transition-transform group-hover:scale-110 group-hover:rotate-12">
                <Icon size={120} strokeWidth={1} style={{ color }} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
                    <div className="rounded-xl p-2.5" style={{ backgroundColor: `${color}15` }}>
                        <Icon size={20} style={{ color }} />
                    </div>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold tabular-nums text-foreground">
                        {value.toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground/60">
                        / {total.toLocaleString()}
                    </span>
                </div>

                {/* Premium Progress Bar */}
                <div className="space-y-2">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/50">
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                                width: `${pct}%`,
                                backgroundColor: color,
                                boxShadow: `0 0 12px ${color}40`,
                            }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-medium uppercase tracking-tight">
                        <span className="text-muted-foreground/80">{description}</span>
                        <span style={{ color }}>{pct}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface RateCardProps {
    title: string;
    rate: number;
    color: string;
    formula: string;
}

export function RateCard({ title, rate, color, formula }: RateCardProps) {
    return (
        <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{title}</p>
            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black tabular-nums text-foreground">
                    {rate.toFixed(1)}%
                </span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50 mb-3">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                        width: `${rate}%`,
                        backgroundColor: color,
                    }}
                />
            </div>
            <p className="text-[10px] font-medium text-muted-foreground/60 uppercase">{formula}</p>
        </div>
    );
}
