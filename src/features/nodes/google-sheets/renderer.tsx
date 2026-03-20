import { useReducer, useState, useEffect, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/google-sheets/domain/google-sheets.constants";
import { 
  useGoogleSheetsCredentials, 
  useGoogleSheets, 
  useGoogleSheetsColumns,
  useTestGoogleSheetsCredential 
} from "@/features/integrations/google-sheets/hooks/use-google-sheets-integration";
import { GoogleSheetsCredentialsDialog } from "@/features/integrations/google-sheets/presentation/google-sheets-credentials-dialog";
import { GoogleSheetsConfigForm } from "@/features/integrations/google-sheets/presentation/google-sheets-config-form";
import { createGoogleSheetsConfigDraft, googleSheetsConfigReducer } from "@/features/integrations/google-sheets/state/google-sheets-config.state";
import type { GoogleSheetsNodeData } from "./schema";
import { GoogleSheetsLogo } from "./logo";
import type { CellItem } from "@/features/integrations/google-sheets/presentation/components/cell-value-stack";

function cellItemsToJson(items: CellItem[]): string {
  const obj: Record<string, string> = {};
  for (const item of items) {
    if (item.column) {
      obj[item.column] = item.value ?? "";
    }
  }
  return JSON.stringify(obj);
}

export function GoogleSheetsNodeRenderer({ id, data, selected }: NodeProps & { data: GoogleSheetsNodeData }) {
  const { setNodes } = useReactFlow();
  const queryClient = useQueryClient();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [draft, dispatch] = useReducer(googleSheetsConfigReducer, createGoogleSheetsConfigDraft(data));

  const credentialsQuery = useGoogleSheetsCredentials(DEFAULT_ORG_ID);
  
  // Track when we're waiting for a newly created credential after OAuth
  const awaitingNewCredential = useRef(false);
  const prevCredentialCount = useRef(credentialsQuery.data?.length ?? 0);

  // Auto-select the newest credential after OAuth completes
  useEffect(() => {
    const creds = credentialsQuery.data ?? [];
    if (awaitingNewCredential.current && creds.length > prevCredentialCount.current) {
      // A new credential appeared — select the most recently created one
      const newest = [...creds].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      if (newest) {
        dispatch({ type: "set", payload: { credentialId: newest.id } });
      }
      awaitingNewCredential.current = false;
    }
    prevCredentialCount.current = creds.length;
  }, [credentialsQuery.data]);

  const sheetsQuery = useGoogleSheets(
    DEFAULT_ORG_ID,
    draft.credentialId && draft.credentialId !== "__none" ? draft.credentialId : undefined,
    draft.spreadsheetId || undefined
  );

  const columnsQuery = useGoogleSheetsColumns(
    DEFAULT_ORG_ID,
    draft.credentialId && draft.credentialId !== "__none" ? draft.credentialId : undefined,
    draft.spreadsheetId || undefined,
    draft.sheetId || undefined
  );

  const testCredential = useTestGoogleSheetsCredential(DEFAULT_ORG_ID);

  const openConfig = () => {
    dispatch({ type: "reset", payload: createGoogleSheetsConfigDraft(data) });
    setConfigOpen(true);
  };

  const updateNodeData = (newData: Partial<GoogleSheetsNodeData>) => {
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)),
    );
  };

  const onSaveConfig = () => {
    if (!draft.credentialId || !draft.action || !draft.spreadsheetId || !draft.sheetId) {
      toast.error("Account, Action, Spreadsheet and Sheet are required");
      return;
    }

    let responseMapping;
    try {
      responseMapping = JSON.parse(draft.responseMappingText);
      if (!Array.isArray(responseMapping)) throw new Error();
    } catch {
      toast.error("Invalid Response Mapping JSON structure");
      return;
    }

    const newData: Partial<GoogleSheetsNodeData> = {
      action: draft.action,
      credentialId: draft.credentialId,
      spreadsheetId: draft.spreadsheetId,
      spreadsheetName: draft.spreadsheetName,
      sheetId: draft.sheetId,
      rowId: draft.rowId,
      values: cellItemsToJson(draft.valuesItems),
      filter: cellItemsToJson(draft.filterItems),
      timeoutMs: draft.timeoutMs,
      responseMapping,
    };

    updateNodeData(newData);
    setConfigOpen(false);
    toast.success("Google Sheets node updated");
  };

  const onTestConnection = async () => {
    if (!draft.credentialId || draft.credentialId === "__none") {
      toast.error("Select a Google Sheets credential first");
      return;
    }
    try {
      const result = await testCredential.mutateAsync(draft.credentialId);
      if (result.ok) toast.success("Connection successful");
      else toast.error(result.errorMessage ?? "Connection failed");
    } catch {
      toast.error("Connection test failed");
    }
  };

  const isConfigured = !!data.credentialId && !!data.spreadsheetId && !!data.sheetId;
  
  const getActionLabel = () => {
    if (!isConfigured) return "Configure...";
    switch(data.action) {
      case "insert_row": return "Insert Row";
      case "update_row": return "Update Row";
      case "get_row": return "Get Row(s)";
      default: return "Google Sheets";
    }
  };

  return (
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
          <div className="mt-0.5 shrink-0 rounded bg-emerald-100 p-1 dark:bg-emerald-950/40">
            <GoogleSheetsLogo className="size-3.5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={cn(
              "truncate text-sm font-medium",
              isConfigured ? "text-foreground" : "text-muted-foreground"
            )}>
              {getActionLabel()}
            </p>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="size-2 border-2 border-background bg-primary !transition-transform group-hover:scale-125"
      />

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0">
          <DialogHeader className="px-5 pt-5">
            <DialogTitle className="flex items-center gap-2">
               <GoogleSheetsLogo className="size-5" />
               Google Sheets
            </DialogTitle>
            <DialogDescription>
              Configure the Google Sheets action parameters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <GoogleSheetsConfigForm
              orgId={DEFAULT_ORG_ID}
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              sheets={sheetsQuery.data ?? []}
              columns={columnsQuery.data ?? []}
              sheetsLoading={sheetsQuery.isLoading}
              columnsLoading={columnsQuery.isLoading}
              onDraftChange={(patch) => dispatch({ type: "set", payload: patch })}
              onConnectAccount={() => setCredentialsOpen(true)}
              onTestConnection={onTestConnection}
              testingConnection={testCredential.isPending}
            />
          </div>
          
          <div className="flex justify-end border-t px-5 py-3">
            <Button onClick={onSaveConfig} size="sm" className="h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="size-3.5" />
              Save config
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <GoogleSheetsCredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={() => {
          // Signal that we should auto-select the new credential when it appears
          awaitingNewCredential.current = true;
          // Invalidate credentials list to pick up newly created OAuth credential
          queryClient.invalidateQueries({ queryKey: ["integrations", "google-sheets", "credentials", DEFAULT_ORG_ID] });
        }}
      />
    </div>
  );
}
