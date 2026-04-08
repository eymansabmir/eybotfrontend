import * as React from "react"
import { cn } from "@/lib/utils"

export function LockedBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded bg-orange-100 px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider text-orange-600 border border-orange-200 transition-colors shadow-sm",
        className
      )}
      {...props}
    >
      Locked
    </span>
  )
}
