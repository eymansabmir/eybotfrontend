import { useState, useEffect } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { useNocoDBCredentials } from "@/features/integrations/nocodb/hooks/use-nocodb-integration";
import { NocoDBConfigForm } from "@/features/integrations/nocodb/presentation/nocodb-config-form";
import { NocoDBCredentialDialog } from "@/features/integrations/nocodb/presentation/nocodb-credentials-dialog";
import { createNocoDBConfigDraft, type NocoDBConfigDraft } from "@/features/integrations/nocodb/state/nocodb-config.state";
import { NocodbLogo } from "./icon";

import type { NocoDBNodeData } from "./schema";
import { nocodbNode } from "./index";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
    <NodeFrame
        selected={selected}
        icon={<NocodbLogo className="size-4" />}
        title="NocoDB"
        popoverTitle="Configure NocoDB"
        description={nocodbNode.config.description}
        summary={data.action ? getActionLabel(data.action) : "Configure..."}
        showPopover={selected}
        popoverClassName="w-[380px]"
        compactBody={
            <div className="min-w-0 flex flex-col mt-0.5">
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
        }
        popoverBody={
            <div className="space-y-4">
                <NocoDBConfigForm
                    draft={draft}
                    credentials={credentialsQuery.data ?? []}
                    onDraftChange={(patch) => setDraft((prev: NocoDBConfigDraft) => ({ ...prev, ...patch }))}
                    onConnectAccount={() => setCredentialsOpen(true)}
                />
            </div>
        }
        popoverFooter={
            <Button 
                onClick={onSaveConfig} 
                size="sm" 
                className="h-8 gap-1.5 font-bold shadow-sm bg-[var(--ey-yellow)] text-black hover:brightness-95 transition-all w-full"
            >
                <Save className="size-3.5" />
                Save Configuration
            </Button>
        }
        extraContent={
            <NocoDBCredentialDialog
                orgId={DEFAULT_ORG_ID}
                open={credentialsOpen}
                onOpenChange={setCredentialsOpen}
                onCreated={(credential: any) => {
                    setDraft((prev: NocoDBConfigDraft) => ({ ...prev, credentialId: credential.id }));
                }}
            />
        }
    />
  );
}
