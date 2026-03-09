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
        <div className="flex h-full w-full flex-col justify-between rounded-l-xl bg-muted/40 p-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">Create Campaign</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Launch a targeted message in just a few guided steps.
                </p>

                <div className="mt-8 space-y-0">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const isLast = index === steps.length - 1;

                        return (
                            <div key={index} className="flex gap-3">
                                {/* Circle + Connector Column */}
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                                            isCompleted && "border-green-500 bg-green-500 text-white",
                                            isActive && "border-primary bg-primary text-primary-foreground",
                                            !isActive && !isCompleted && "border-border bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? <Check className="size-4" /> : index + 1}
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={cn(
                                                "w-0.5 grow my-1",
                                                index < currentStep ? "bg-green-500" : "bg-border"
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <div
                                    className={cn(
                                        "rounded-lg p-3 transition-all",
                                        isActive && "bg-card shadow-sm"
                                    )}
                                >
                                    <p
                                        className={cn(
                                            "text-sm font-medium",
                                            isActive ? "text-foreground" : "text-muted-foreground"
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    {isActive && (
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
