import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IntegrationShellProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function IntegrationShell({ title, subtitle, icon, actions, children, className }: IntegrationShellProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card/80 shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-muted p-2 text-foreground">{icon}</div>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        {actions}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
