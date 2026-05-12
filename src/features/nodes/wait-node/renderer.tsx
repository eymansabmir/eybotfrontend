import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Timer } from "lucide-react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { WaitNodeData } from "./schema";

export function WaitNodeRenderer({
  id,
  data,
  selected,
}: NodeProps & { data: WaitNodeData }) {
  const { setNodes } = useReactFlow();

  const updateData = (updates: Partial<WaitNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  };

  return (
    <NodeFrame
      selected={selected}
      icon={<Timer size={14} className="text-primary" />}
      title="Wait"
      popoverTitle="Configure Wait Duration"
      description="Pause the flow for a specific amount of time before continuing."
      summary={`Wait for ${data.duration} ${data.unit}`}
      showPopover={selected}
      popoverBody={
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-0.5">
                Duration
              </label>
              <Input
                type="number"
                min={1}
                value={data.duration}
                onChange={(e) => updateData({ duration: Number(e.target.value) })}
                className="h-9 border-muted-foreground/20 focus-visible:ring-primary/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-0.5">
                Unit
              </label>
              <Select
                value={data.unit}
                onValueChange={(val: any) => updateData({ unit: val })}
              >
                <SelectTrigger className="h-9 border-muted-foreground/20 hover:border-primary/30 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="minutes">Minutes</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[10px] leading-relaxed text-primary/70 italic">
               Tip: Use "seconds" for typing effects or "days" for multi-day follow-up campaigns.
            </p>
          </div>
        </div>
      }
    />
  );
}
