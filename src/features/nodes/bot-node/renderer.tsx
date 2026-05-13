import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { useBots, useBot } from "@/features/bots/data/queries/use-bots";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BotNodeData } from "./schema";
import { botNodeConfig } from "./config";
import { BotLogo } from "./logo";
import { nodeRegistry } from "../registry";

export function BotNodeRenderer({
  id,
  data,
  selected,
}: NodeProps & { data: BotNodeData }) {
  const { setNodes } = useReactFlow();
  const { data: bots, isLoading: isLoadingBots } = useBots();
  const { data: targetBot, isLoading: isLoadingTargetBot } = useBot(data.targetFlowId);

  const updateData = (updates: Partial<BotNodeData>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  };

  const selectedBot = bots?.find((b) => b.id === data.targetFlowId);
  
  // Filter nodes that are worth jumping to (e.g., skip start nodes if they are redundant)
  const availableNodes = (targetBot?.nodes as any[])?.filter((n: any) => 
    n.type !== 'start' // Usually we jump to groups or specific action nodes
  ) || [];

  return (
    <NodeFrame
      selected={selected}
      id={id}
      icon={<BotLogo size={14} className="text-primary" />}
      title={data.label || "Bot Node"}
      popoverTitle="Select Target Bot"
      description={botNodeConfig.description}
      summary={selectedBot?.name || "No bot selected"}
      showPopover={selected}
      popoverClassName="w-[320px]"
      popoverBody={
        <div className="space-y-5 py-2">
          {/* Flow Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">
              Jump to Flow
            </label>
            <Select
              value={data.targetFlowId}
              onValueChange={(val) => updateData({ targetFlowId: val, targetNodeId: undefined })}
              disabled={isLoadingBots}
            >
              <SelectTrigger className="h-10 border-muted-foreground/20 hover:border-primary/40 transition-all">
                <SelectValue placeholder={isLoadingBots ? "Loading bots..." : "Choose a bot..."} />
              </SelectTrigger>
              <SelectContent>
                {bots?.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id!}>
                    <div className="flex items-center gap-2">
                      <BotLogo size={12} className="text-primary/60" />
                      <span>{bot.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Node Selection (Optional) */}
          {data.targetFlowId && (
             <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">
                  Start from Node (Optional)
                </label>
                <Select
                  value={data.targetNodeId || "START_NODE"}
                  onValueChange={(val) => updateData({ targetNodeId: val === "START_NODE" ? undefined : val })}
                  disabled={isLoadingTargetBot}
                >
                  <SelectTrigger className="h-10 border-muted-foreground/20 hover:border-primary/40 transition-all">
                    <SelectValue placeholder={isLoadingTargetBot ? "Loading nodes..." : "Choose a node..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="START_NODE">
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                          <span>Start Node</span>
                       </div>
                    </SelectItem>
                    {availableNodes.map((node: any) => {
                       const nodeDef = nodeRegistry[node.type];
                       const NodeIcon = nodeDef?.config?.icon;
                       return (
                        <SelectItem key={node.id} value={node.id}>
                          <div className="flex items-center gap-2">
                            {NodeIcon && <div className="text-muted-foreground/60">{NodeIcon}</div>}
                            <span>{node.data?.label || node.label || node.data?.name || node.type}</span>
                          </div>
                        </SelectItem>
                       );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-[9px] text-muted-foreground/60 italic pl-1">
                   Leave as default to start from the beginning.
                </p>
             </div>
          )}
          
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-1 duration-200">
             <p className="text-[10px] leading-relaxed text-primary/70">
                Variables with matching names will be preserved across bots. The conversation will transition immediately upon reaching this node.
             </p>
          </div>
        </div>
      }
    />
  );
}
