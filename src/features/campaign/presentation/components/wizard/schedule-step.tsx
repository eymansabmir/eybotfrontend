import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CalendarClock, CheckCircle2 } from "lucide-react";

import type { ExecutionMode } from "../../../types";

interface ScheduleStepProps {
    title: string;
    botId: string;
    filePath: string;
    executionMode: ExecutionMode;
    onModeChange: (mode: ExecutionMode) => void;
    executeAt: string;
    onExecuteAtChange: (val: string) => void;
}

export function ScheduleStep({
    title,
    botId,
    filePath,
    executionMode,
    onModeChange,
    executeAt,
    onExecuteAtChange,
}: ScheduleStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Schedule</h3>
                <p className="text-sm text-muted-foreground">
                    Review and decide when to send your campaign.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Summary Card */}
                <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Summary</h4>

                    <div className="space-y-3">
                        <SummaryRow label="Campaign Name" value={title} />
                        <SummaryRow label="Bot ID" value={botId} />
                        <SummaryRow
                            label="Recipients"
                            value={
                                filePath ? (
                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="size-3" /> File uploaded
                                    </span>
                                ) : (
                                    "Not uploaded"
                                )
                            }
                        />
                    </div>
                </div>

                {/* Execution Timing */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-foreground">Execution Timing</h4>

                    {/* NOW radio card */}
                    <label
                        className={cn(
                            "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                            executionMode === "NOW"
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "border-border hover:border-muted-foreground/30"
                        )}
                    >
                        <input
                            type="radio"
                            name="executionMode"
                            value="NOW"
                            checked={executionMode === "NOW"}
                            onChange={() => onModeChange("NOW")}
                            className="accent-[hsl(var(--primary))] size-4"
                        />
                        <div className="flex items-center gap-2 flex-1">
                            <Zap className="size-4 text-primary shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">Send Immediately</span>
                                <span className="text-xs text-muted-foreground">
                                    Start sending messages right now
                                </span>
                            </div>
                        </div>
                    </label>

                    {/* SCHEDULED radio card */}
                    <label
                        className={cn(
                            "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                            executionMode === "SCHEDULED"
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "border-border hover:border-muted-foreground/30"
                        )}
                    >
                        <input
                            type="radio"
                            name="executionMode"
                            value="SCHEDULED"
                            checked={executionMode === "SCHEDULED"}
                            onChange={() => onModeChange("SCHEDULED")}
                            className="accent-[hsl(var(--primary))] size-4"
                        />
                        <div className="flex items-center gap-2 flex-1">
                            <CalendarClock className="size-4 text-primary shrink-0" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-foreground">Schedule for Later</span>
                                <span className="text-xs text-muted-foreground">
                                    Pick a specific date and time
                                </span>
                            </div>
                        </div>
                    </label>

                    {/* Date/Time Picker (shown only for SCHEDULED) */}
                    {executionMode === "SCHEDULED" && (
                        <div className="space-y-2 pl-1">
                            <Label htmlFor="schedule-datetime">Send Date & Time</Label>
                            <Input
                                id="schedule-datetime"
                                type="datetime-local"
                                value={executeAt}
                                onChange={(e) => onExecuteAtChange(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground">{value}</p>
        </div>
    );
}
