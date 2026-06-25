import { endOfDay, format, startOfDay } from "date-fns";
import { CalendarRange, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { CampaignAnalyticsDateFilter } from "../../../types";

interface CampaignAnalyticsDateFilterBarProps {
    value: CampaignAnalyticsDateFilter;
    onChange: (next: CampaignAnalyticsDateFilter) => void;
    variant?: "card" | "inline";
}

function formatRangeLabel(value: CampaignAnalyticsDateFilter): string {
    if (value.startDate && value.endDate) {
        return `${format(new Date(value.startDate), "MMM d")} – ${format(new Date(value.endDate), "MMM d, yyyy")}`;
    }
    if (value.startDate) {
        return `From ${format(new Date(value.startDate), "MMM d, yyyy")}`;
    }
    if (value.endDate) {
        return `Until ${format(new Date(value.endDate), "MMM d, yyyy")}`;
    }
    return "Date range";
}

export function CampaignAnalyticsDateFilterBar({
    value,
    onChange,
    variant = "card",
}: CampaignAnalyticsDateFilterBarProps) {
    const hasFilter = Boolean(value.startDate || value.endDate);

    const applyPreset = (days: number) => {
        const end = endOfDay(new Date());
        const start = startOfDay(new Date(Date.now() - days * 24 * 60 * 60 * 1000));
        onChange({
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        });
    };

    const pickerBody = (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                    <Label className="text-xs">From</Label>
                    <input
                        type="date"
                        aria-label="Filter from date"
                        className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                        value={value.startDate ? format(new Date(value.startDate), "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                            const next = e.target.value
                                ? startOfDay(new Date(e.target.value)).toISOString()
                                : undefined;
                            onChange({ ...value, startDate: next });
                        }}
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">To</Label>
                    <input
                        type="date"
                        aria-label="Filter to date"
                        className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                        value={value.endDate ? format(new Date(value.endDate), "yyyy-MM-dd") : ""}
                        onChange={(e) => {
                            const next = e.target.value
                                ? endOfDay(new Date(e.target.value)).toISOString()
                                : undefined;
                            onChange({ ...value, endDate: next });
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8" onClick={() => applyPreset(7)}>
                    Last 7 days
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => applyPreset(30)}>
                    Last 30 days
                </Button>
                {hasFilter && (
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => onChange({})}>
                        <X className="size-3.5" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );

    if (variant === "inline") {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "h-9 gap-2 rounded-xl shrink-0 max-w-[220px]",
                            hasFilter && "border-primary/40 bg-primary/5 text-primary"
                        )}
                    >
                        <CalendarRange className="size-3.5 shrink-0" />
                        <span className="truncate text-xs font-medium">{formatRangeLabel(value)}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72">
                    <p className="text-xs text-muted-foreground mb-3">
                        Filter metrics to recipients added within the selected dates.
                    </p>
                    {pickerBody}
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                        <CalendarRange className="size-4 text-primary" />
                        Date Range Filter
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Filter metrics to recipients added within the selected dates.
                    </p>
                </div>
                {pickerBody}
            </div>
            {hasFilter && (
                <p className="text-xs text-primary mt-3 font-medium">
                    Showing filtered analytics
                    {value.startDate && ` from ${format(new Date(value.startDate), "MMM d, yyyy")}`}
                    {value.endDate && ` to ${format(new Date(value.endDate), "MMM d, yyyy")}`}
                </p>
            )}
        </div>
    );
}
