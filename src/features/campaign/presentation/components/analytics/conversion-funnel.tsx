interface FunnelStep {
    label: string;
    value: number;
    color: string;
}

interface ConversionFunnelProps {
    steps: FunnelStep[];
}

export function ConversionFunnel({ steps }: ConversionFunnelProps) {
    const maxValue = steps[0]?.value ?? 1;

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-8 tracking-tight">Conversion Funnel</h3>

            <div className="space-y-6">
                {steps.map((step, i) => {
                    const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
                    const prevStep = i > 0 ? steps[i - 1] : null;
                    const dropoff = prevStep && prevStep.value > 0
                        ? ((prevStep.value - step.value) / prevStep.value * 100).toFixed(1)
                        : null;

                    return (
                        <div key={step.label} className="group relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{step.label}</span>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-lg font-bold tabular-nums text-foreground">
                                            {step.value.toLocaleString()}
                                        </div>
                                        <div className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tighter">
                                            {pct.toFixed(1)}% of total
                                        </div>
                                    </div>
                                    {dropoff && Number(dropoff) > 0 && (
                                        <div className="min-w-[70px] px-2 py-1 rounded bg-red-500/5 border border-red-500/10 text-center">
                                            <span className="text-[11px] font-bold text-red-500">
                                                ↓ {dropoff}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-4 w-full overflow-hidden rounded-lg bg-muted/40">
                                <div
                                    className="h-full rounded-lg transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1)"
                                    style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(to right, ${step.color}, ${step.color}dd)`,
                                        boxShadow: `0 0 15px ${step.color}20`,
                                    }}
                                />
                            </div>

                            {/* Connector line for visual continuity */}
                            {i < steps.length - 1 && (
                                <div className="absolute left-[20px] -bottom-[12px] h-[12px] w-[1px] bg-gradient-to-b from-muted to-transparent" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
