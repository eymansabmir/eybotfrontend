import { useState } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, setDraft] = useState<NocoDBConfigDraft>(() => createNocoDBConfigDraft(data));

  const credentialsQuery = useNocoDBCredentials(DEFAULT_ORG_ID);

  const openConfig = () => {
    setDraft(createNocoDBConfigDraft(data));
    setConfigOpen(true);
  };

  const updateNodeData = (newData: Partial<NocoDBNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    updateNodeData(draft);
    setConfigOpen(false);
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
    <>
      <div
        onClick={openConfig}
        className={cn(
          "group relative flex min-w-40 max-w-[240px] cursor-pointer rounded-lg border bg-background p-3 transition-all hover:shadow-md",
          selected ? "border-primary ring-1 ring-primary" : "border-border shadow-sm",
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="size-2 border-2 border-background bg-muted-foreground !transition-transform group-hover:scale-125"
        />

        <div className="flex w-full flex-col gap-2">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 shrink-0 rounded bg-indigo-50 dark:bg-indigo-950/40">
              <NocodbLogo className="size-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className={cn(
                "truncate text-sm font-medium",
                data.action ? "text-foreground" : "text-muted-foreground"
              )}>
                {data.action ? getActionLabel(data.action) : "Configure..."}
              </p>
              {data.tableName && (
                <p className="truncate text-[10px] text-muted-foreground">
                  {data.tableName}
                </p>
              )}
            </div>
          </div>

          {data.responseMapping && data.responseMapping.some(m => m.variableName?.trim()) && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-hidden border-t border-border/40 pt-2">
              <span className="shrink-0 text-[10px] font-medium italic text-muted-foreground text-[8px]  tracking-wider uppercase">Set</span>
              {data.responseMapping.filter(m => m.variableName?.trim()).map((m, i) => (
                <span key={i} className="truncate rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {m.variableName}
                </span>
              ))}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="size-2 border-2 border-background bg-primary !transition-transform group-hover:scale-125"
        />
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="flex items-center gap-2 text-base">
               <NocodbLogo className="size-5" />
               NocoDB
            </DialogTitle>
            <DialogDescription className="px-5 text-xs text-muted-foreground">
              Select table and configure database operations.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <NocoDBConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              onDraftChange={(patch) => setDraft((prev: NocoDBConfigDraft) => ({ ...prev, ...patch }))}
              onConnectAccount={() => setCredentialsOpen(true)}
            />
          </div>
          <div className="flex justify-end border-t border-border/50 px-5 py-3 bg-muted/20">
            <Button onClick={onSaveConfig} size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              <Save className="size-3.5" />
              Save config
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <NocoDBCredentialDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={(credential: any) => {
          setDraft((prev: NocoDBConfigDraft) => ({ ...prev, credentialId: credential.id }));
        }}
      />
    </>
  );
}
