import { SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function RoadmapBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-4 py-2.5">
      <SparklesIcon className="size-4 shrink-0 text-primary" />
      <p className="text-sm text-muted-foreground">
        <Badge variant="outline" className="mr-2 border-primary/40 text-primary">
          Roadmap Preview
        </Badge>
        This screen showcases planned capabilities with sample data. No backend integration yet.
      </p>
    </div>
  );
}
