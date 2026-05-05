import * as React from "react";
import { cn } from "@/lib/utils";

export interface AutosizeTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxHeight?: number;
}

const AutosizeTextarea = React.forwardRef<HTMLTextAreaElement, AutosizeTextareaProps>(
  ({ className, maxHeight, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    const adjustHeight = React.useCallback(() => {
      const textarea = combinedRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        const newHeight = Math.min(textarea.scrollHeight, maxHeight || Infinity);
        textarea.style.height = `${newHeight}px`;
      }
    }, [combinedRef, maxHeight]);

    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    return (
      <textarea
        {...props}
        ref={combinedRef}
        onInput={(e) => {
          adjustHeight();
          props.onInput?.(e);
        }}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-hidden transition-all",
          className
        )}
      />
    );
  }
);
AutosizeTextarea.displayName = "AutosizeTextarea";

export { AutosizeTextarea };
