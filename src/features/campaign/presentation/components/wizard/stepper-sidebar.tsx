import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepConfig {
    title: string;
    description: string;
}

interface StepperSidebarProps {
    steps: StepConfig[];
    currentStep: number;
}

export function StepperSidebar({ steps, currentStep }: StepperSidebarProps) {
    return (
        <div className="group relative z-20 h-full w-20 hover:w-[280px] flex flex-col justify-between rounded-l-xl bg-muted/40 p-6 transition-all duration-500 ease-in-out overflow-hidden border-r border-border/50 shadow-2xl shadow-black/5">
            <div className="min-w-[230px]"> {/* Fixed width internal container to prevent text wrapping during transition */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                    <h2 className="text-xl font-bold text-foreground whitespace-nowrap">Create Campaign</h2>
                    <p className="mt-1 text-[11px] leading-tight text-muted-foreground whitespace-nowrap">
                        Launch a targeted message in just a few steps.
                    </p>
                </div>

                <div className="mt-10 space-y-0">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={index} className="flex gap-4">
                                {/* Circle + Connector Column */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black transition-all duration-300",
                                            isCompleted && "border-green-500 bg-green-500 text-white",
                                            isActive && "border-primary bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20",
                                            !isActive && !isCompleted && "border-border bg-muted/50 text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? <Check className="size-4" /> : index + 1}
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={cn(
                                                "w-0.5 grow my-1 min-h-[30px]",
                                                index < currentStep ? "bg-green-500" : "bg-border"
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Label Container: revealed on hover */}
                                <div
                                    className={cn(
                                        "rounded-lg p-3 transition-all duration-300 flex-1 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0",
                                        isActive && "bg-card shadow-sm border border-border/40"
                                    )}
                                >
                                    <p
                                        className={cn(
                                            "text-xs font-bold uppercase tracking-wider whitespace-nowrap",
                                            isActive ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    {isActive && (
                                        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground whitespace-nowrap">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Navigation hint for users */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[9px] font-bold text-muted-foreground tracking-widest uppercase text-center border-t border-border/40 pt-4">
                Guided Process
            </div>
        </div>
    );
}
