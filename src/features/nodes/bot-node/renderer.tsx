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
import { Plus, Trash, ArrowLeftRight } from "lucide-react";
import { useVariablesStore } from "@/features/variables/store";

export function BotNodeRenderer({
  id,
  data,
  selected,
}: NodeProps & { data: BotNodeData }) {
  const { setNodes, getNodes } = useReactFlow();
  const { data: bots, isLoading: isLoadingBots } = useBots();
  const { data: targetBot, isLoading: isLoadingTargetBot } = useBot(data.targetFlowId);
  const storedVariables = useVariablesStore((state) => state.variables);

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
  
  // Scans nodes for variables used in Ask Question, Set Variable, etc.
  const scanVariables = (nodes: any[]): string[] => {
    const vars = new Set<string>();
    nodes?.forEach(n => {
      if (n.type === 'ask_question' || n.type === 'nps') {
        if (n.data?.variableName) vars.add(n.data.variableName);
      } else if (n.type === 'set_variable') {
        if (n.data?.targetVariable) vars.add(n.data.targetVariable);
      }
      // Also check for template variables in text
      const text = JSON.stringify(n.data);
      const matches = text.match(/{{([^}]+)}}/g);
      matches?.forEach(m => vars.add(m.replace(/{{|}}/g, '').replace(/^(session|contact)\./, '')));
    });
    return Array.from(vars).filter(v => !v.includes('.') && !v.startsWith('sys.'));
  };

  const targetVariables = scanVariables(targetBot?.nodes || []);
  
  // Combine scanned variables from current nodes + variables manually created in the Variable Manager
  const nodeVariables = scanVariables(getNodes().map(n => ({ type: n.type, data: n.data })));
  const managerVariables = storedVariables.map(v => v.name);
  const currentVariables = Array.from(new Set([...nodeVariables, ...managerVariables])).sort();

  const addMapping = (type: 'input' | 'output') => {
    const field = type === 'input' ? 'inputMappings' : 'outputMappings';
    const current = data[field] || [];
    updateData({ [field]: [...current, { parentKey: "", childKey: "" }] });
  };

  const removeMapping = (type: 'input' | 'output', index: number) => {
    const field = type === 'input' ? 'inputMappings' : 'outputMappings';
    const current = [...(data[field] || [])];
    current.splice(index, 1);
    updateData({ [field]: current });
  };

  const updateMapping = (type: 'input' | 'output', index: number, updates: Partial<{ parentKey: string; childKey: string }>) => {
    const field = type === 'input' ? 'inputMappings' : 'outputMappings';
    const current = [...(data[field] || [])];
    current[index] = { ...current[index], ...updates };
    updateData({ [field]: current });
  };

  const availableNodes = (targetBot?.nodes as any[])?.filter((n: any) => 
    n.type !== 'start' 
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
      popoverClassName="w-[400px]"
      popoverBody={
        <div className="space-y-6 py-2">
          {/* Flow Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em] pl-1">
              Jump to Flow
            </label>
            <Select
              value={data.targetFlowId}
              onValueChange={(val) => updateData({ targetFlowId: val, targetNodeId: undefined, inputMappings: [], outputMappings: [] })}
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

          {/* Mapping UI */}
          {data.targetFlowId && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
               {/* Inputs Section */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">
                       📥 Input Mapping (To Child)
                    </label>
                    <button onClick={() => addMapping('input')} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1">
                       <Plus size={10} /> Add
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {data.inputMappings?.map((mapping, idx) => (
                      <div key={`input-${idx}`} className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-muted-foreground/5">
                        <Select value={mapping.parentKey} onValueChange={(v) => updateMapping('input', idx, { parentKey: v })}>
                           <SelectTrigger className="h-8 text-[11px] bg-background">
                             <SelectValue placeholder="Parent Var" />
                           </SelectTrigger>
                           <SelectContent>
                              {currentVariables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <ArrowLeftRight size={12} className="text-muted-foreground/40 shrink-0" />
                        <Select value={mapping.childKey} onValueChange={(v) => updateMapping('input', idx, { childKey: v })}>
                           <SelectTrigger className="h-8 text-[11px] bg-background">
                             <SelectValue placeholder="Child Var" />
                           </SelectTrigger>
                           <SelectContent>
                              {targetVariables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <button onClick={() => removeMapping('input', idx)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                    {(!data.inputMappings || data.inputMappings.length === 0) && (
                      <p className="text-[10px] text-muted-foreground/40 italic text-center py-2 bg-muted/10 rounded-lg border border-dashed border-muted-foreground/10">
                        No input mappings defined.
                      </p>
                    )}
                  </div>
               </div>

               {/* Outputs Section */}
               <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.1em]">
                       📤 Output Mapping (From Child)
                    </label>
                    <button onClick={() => addMapping('output')} className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1">
                       <Plus size={10} /> Add
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {data.outputMappings?.map((mapping, idx) => (
                      <div key={`output-${idx}`} className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-muted-foreground/5">
                        <Select value={mapping.childKey} onValueChange={(v) => updateMapping('output', idx, { childKey: v })}>
                           <SelectTrigger className="h-8 text-[11px] bg-background">
                             <SelectValue placeholder="Child Result" />
                           </SelectTrigger>
                           <SelectContent>
                              {targetVariables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <ArrowLeftRight size={12} className="text-muted-foreground/40 shrink-0" />
                        <Select value={mapping.parentKey} onValueChange={(v) => updateMapping('output', idx, { parentKey: v })}>
                           <SelectTrigger className="h-8 text-[11px] bg-background">
                             <SelectValue placeholder="Parent Var" />
                           </SelectTrigger>
                           <SelectContent>
                              {currentVariables.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                           </SelectContent>
                        </Select>
                        <button onClick={() => removeMapping('output', idx)} className="text-muted-foreground hover:text-destructive p-1">
                          <Trash size={12} />
                        </button>
                      </div>
                    ))}
                    {(!data.outputMappings || data.outputMappings.length === 0) && (
                      <p className="text-[10px] text-muted-foreground/40 italic text-center py-2 bg-muted/10 rounded-lg border border-dashed border-muted-foreground/10">
                        No output mappings defined.
                      </p>
                    )}
                  </div>
               </div>

              {/* Node Selection */}
              <div className="space-y-2 pt-2 border-t border-muted-foreground/10">
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
              </div>
            </div>
          )}
          
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
             <p className="text-[10px] leading-relaxed text-primary/70">
                Variable mapping allows you to pass data between bots explicitly. Mapped variables will be automatically added to the Variable Manager.
             </p>
          </div>
        </div>
      }
    />
  );
}
