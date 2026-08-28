import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiStatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function KpiStatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  className,
}: KpiStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {Icon ? (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="size-4 text-primary" />
          </div>
        ) : null}
      </div>
      <p className="text-3xl font-bold tabular-nums text-foreground">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {delta ? (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            deltaPositive === true && "text-emerald-600 dark:text-emerald-400",
            deltaPositive === false && "text-red-600 dark:text-red-400",
            deltaPositive === undefined && "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}
