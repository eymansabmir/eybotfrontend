import { ChevronRight } from "lucide-react";

interface FunnelStep {
    label: string;
    value: number;
    color: string;
}

interface CampaignFunnelStripProps {
    steps: FunnelStep[];
}

export function CampaignFunnelStrip({ steps }: CampaignFunnelStripProps) {
    const maxValue = steps[0]?.value ?? 1;

    return (
        <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Delivery Funnel
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {steps.map((step, i) => {
                    const pctOfTotal = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
                    const prevStep = i > 0 ? steps[i - 1] : null;
                    const conversionFromPrev =
                        prevStep && prevStep.value > 0 ? (step.value / prevStep.value) * 100 : null;
                    const dropoff =
                        conversionFromPrev != null && conversionFromPrev < 100
                            ? 100 - conversionFromPrev
                            : null;

                    return (
                        <div key={step.label} className="relative min-w-0">
                            {i > 0 && (
                                <ChevronRight
                                    aria-hidden
                                    className="hidden xl:block absolute -left-[10px] top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/35 z-10 pointer-events-none"
                                />
                            )}
                            <div
                                className="rounded-xl border border-border bg-card p-3 shadow-sm h-full transition-shadow hover:shadow-md"
                                style={{ borderTop: `3px solid ${step.color}` }}
                            >
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
                                    {step.label}
                                </p>
                                <p className="text-lg font-black tabular-nums text-foreground mt-1 leading-none">
                                    {step.value.toLocaleString()}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                                    {pctOfTotal.toFixed(0)}% of total
                                </p>
                                {dropoff != null && dropoff > 0 && (
                                    <span className="inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 tabular-nums">
                                        ↓ {dropoff.toFixed(0)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
