import { useState, useEffect } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useNocoDBCredentials } from "@/features/integrations/nocodb/hooks/use-nocodb-integration";
import { NocoDBConfigForm } from "@/features/integrations/nocodb/presentation/nocodb-config-form";
import { NocoDBCredentialDialog } from "@/features/integrations/nocodb/presentation/nocodb-credentials-dialog";
import { createNocoDBConfigDraft, type NocoDBConfigDraft } from "@/features/integrations/nocodb/state/nocodb-config.state";
import { NocodbLogo } from "./icon";

import type { NocoDBNodeData } from "./schema";

export function NocoDBNodeRenderer({ id, data, selected }: NodeProps & { data: NocoDBNodeData }) {
  const { setNodes } = useReactFlow();
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<NocoDBConfigDraft>(() => createNocoDBConfigDraft(data));

  const credentialsQuery = useNocoDBCredentials(DEFAULT_ORG_ID);

  useEffect(() => {
    if (selected) {
      setDraft(createNocoDBConfigDraft(data));
    }
  }, [selected, data]);

  const updateNodeData = (newData: Partial<NocoDBNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    updateNodeData(draft);
    toast.success("NocoDB node updated");
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "create_record": return "Create Record";
      case "update_record": return "Update Record";
      case "search_records": return "Search Records";
      default: return "Database";
    }
  };

  return (
    <div className="relative">
      {/* 1) Condensed Block Face */}
      <div
          className={cn(
              "flex flex-col justify-center relative w-[220px] min-h-[85px] rounded-xl border p-3.5 select-none transition-all cursor-pointer",
              "bg-[var(--node-bg)] border-[var(--border-dim)] hover:shadow-md",
              selected && "border-2 border-[var(--ey-yellow)] shadow-[0_0_10px_rgba(255,230,0,0.15)] -m-[1px]"
          )}
      >
          <Handle
              type="target"
              position={Position.Top}
              className="h-3 w-3 border-2 border-[var(--border-dim)] bg-background shadow-sm hover:scale-125 transition-transform"
          />

          <div className="flex flex-col gap-2.5 w-full">
              <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                      <NocodbLogo className="size-4" />
                  </div>
                  <span className="text-sm font-semibold truncate text-foreground leading-none pr-1">NocoDB</span>
              </div>

              <div className="min-w-0 flex flex-col mt-0.5">
                  <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {data.action ? getActionLabel(data.action) : "Configure..."}
                        </span>
                    </div>
                  
                  {data.tableName && (
                      <div className="text-[9px] text-muted-foreground tracking-wide mt-1 max-w-full truncate">
                          &#91; {data.tableName} &#93;
                      </div>
                  )}

                  {data.responseMapping && data.responseMapping.some(m => m.variableName?.trim()) && (
                      <div className="text-[10px] text-[var(--ey-yellow)] tracking-wide font-bold mt-1 max-w-full truncate">
                          ➔ @{data.responseMapping.find(m => m.variableName?.trim())?.variableName}{data.responseMapping.filter(m => m.variableName?.trim()).length > 1 ? ', ...' : ''}
                      </div>
                  )}
              </div>
          </div>

          <Handle
              type="source"
              position={Position.Bottom}
              className="h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
          />
      </div>

      {/* 2) Popover Configuration Panel */}
      {selected && (
          <div 
              className="absolute top-0 left-[230px] w-[380px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
          >
              <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                      <NocodbLogo className="size-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure NocoDB</span>
                  </div>
              </div>
              
              <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar p-4 text-foreground">
                  <NocoDBConfigForm
                      draft={draft}
                      credentials={credentialsQuery.data ?? []}
                      onDraftChange={(patch) => setDraft((prev: NocoDBConfigDraft) => ({ ...prev, ...patch }))}
                      onConnectAccount={() => setCredentialsOpen(true)}
                  />
              </div>

              <div className="flex justify-end border-t border-[var(--border-dim)] px-4 py-3 bg-muted/10">
                  <Button 
                      onClick={onSaveConfig} 
                      size="sm" 
                      className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
                  >
                      <Save className="size-3.5" />
                      Save Configuration
                  </Button>
              </div>
          </div>
      )}

      {/* Global Credentials Dialog */}
      <NocoDBCredentialDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential: any) => {
          setDraft((prev: NocoDBConfigDraft) => ({ ...prev, credentialId: credential.id }));
        }}
      />
    </div>
  );
}
