import { useReducer, useState, useEffect, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_ORG_ID } from "@/features/integrations/google-sheets/domain/google-sheets.constants";
import { 
  useGoogleSheetsCredentials, 
  useGoogleSheets, 
  useGoogleSheetsColumns,
  useTestGoogleSheetsCredential,
  useGoogleSheetsAccessToken,
} from "@/features/integrations/google-sheets/hooks/use-google-sheets-integration";
import { GoogleSheetsCredentialsDialog } from "@/features/integrations/google-sheets/presentation/google-sheets-credentials-dialog";
import { GoogleSheetsConfigForm } from "@/features/integrations/google-sheets/presentation/google-sheets-config-form";
import { GoogleSpreadsheetPicker } from "@/features/integrations/google-sheets/presentation/components/google-spreadsheet-picker";
import { createGoogleSheetsConfigDraft, googleSheetsConfigReducer } from "@/features/integrations/google-sheets/state/google-sheets-config.state";
import type { GoogleSheetsNodeData } from "./schema";
import { GoogleSheetsLogo } from "./logo";
import type { CellItem } from "@/features/integrations/google-sheets/presentation/components/cell-value-stack";

const ResponseMappingSchema = z.object({
  jsonPath: z.string().min(1),
  variableName: z.string().min(1),
  scope: z.enum(["session", "contact"]),
});

function cellItemsToRecord(items: CellItem[]): Record<string, string> | undefined {
  const obj: Record<string, string> = {};
  for (const item of items) {
    if (item.column) {
      obj[item.column] = item.value ?? "";
    }
  }
  return Object.keys(obj).length > 0 ? obj : undefined;
}

export function GoogleSheetsNodeRenderer({ id, data, selected }: NodeProps & { data: GoogleSheetsNodeData }) {
  const { setNodes } = useReactFlow();
  const queryClient = useQueryClient();
  const [configOpen, setConfigOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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
        dispatch({
          type: "set",
          payload: {
            credentialId: newest.id,
            spreadsheetId: "",
            spreadsheetName: "",
            sheetId: "",
            sheetName: "",
          },
        });
      }
      awaitingNewCredential.current = false;
    }
    prevCredentialCount.current = creds.length;
  }, [credentialsQuery.data]);

  const sheetsQuery = useGoogleSheets(
    DEFAULT_ORG_ID,
    configOpen && draft.credentialId && draft.credentialId !== "__none" ? draft.credentialId : undefined,
    configOpen ? draft.spreadsheetId || undefined : undefined
  );

  const columnsQuery = useGoogleSheetsColumns(
    DEFAULT_ORG_ID,
    configOpen && draft.credentialId && draft.credentialId !== "__none" ? draft.credentialId : undefined,
    configOpen ? draft.spreadsheetId || undefined : undefined,
    configOpen ? draft.sheetId || undefined : undefined
  );

  const testCredential = useTestGoogleSheetsCredential(DEFAULT_ORG_ID);
  const pickerAccessToken = useGoogleSheetsAccessToken(DEFAULT_ORG_ID);

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
      const parsed = JSON.parse(draft.responseMappingText);
      responseMapping = ResponseMappingSchema.array().parse(parsed);
    } catch {
      toast.error("Invalid Response Mapping JSON structure");
      return;
    }

    const selectedSheet = (sheetsQuery.data ?? []).find(
      (sheet) => sheet.id === draft.sheetId,
    );

    const newData: Partial<GoogleSheetsNodeData> = {
      action: draft.action,
      credentialId: draft.credentialId,
      spreadsheetId: draft.spreadsheetId,
      spreadsheetName: draft.spreadsheetName,
      sheetId: draft.sheetId,
      sheetName: draft.sheetName || selectedSheet?.name,
      rowId: draft.rowId,
      values: cellItemsToRecord(draft.valuesItems),
      filter: cellItemsToRecord(draft.filterItems),
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

  const onGetSpreadsheetPickerAccessToken = async (): Promise<string> => {
    if (!draft.credentialId || draft.credentialId === "__none") {
      throw new Error("Select a Google Sheets credential first");
    }
    const token = await pickerAccessToken.mutateAsync(draft.credentialId);
    return token.accessToken;
  };

  // Close config dialog → open native picker (avoids Radix focus trap)
  const onPickSpreadsheet = () => {
    setConfigOpen(false);
    setPickerOpen(true);
  };

  // Picker completed → update draft, re-open config (no reset)
  const onPickerResult = (spreadsheet: { id: string; name: string }) => {
    dispatch({
      type: "set",
      payload: {
        spreadsheetId: spreadsheet.id,
        spreadsheetName: spreadsheet.name,
        sheetId: "",
        sheetName: "",
      },
    });
    setPickerOpen(false);
    setConfigOpen(true);
  };

  // Picker cancelled → re-open config (no reset)
  const onPickerClose = (open: boolean) => {
    if (!open) {
      setPickerOpen(false);
      setConfigOpen(true);
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
              {(data.spreadsheetName || data.sheetName) && (
                <p className="truncate text-[10px] text-muted-foreground">
                  {data.spreadsheetName}{data.sheetName ? ` > ${data.sheetName}` : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          id="default"
          className="size-2 border-2 border-background bg-primary !transition-transform group-hover:scale-125"
        />
      </div>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent
          className="flex max-h-[85vh] max-w-sm flex-col overflow-hidden p-0 text-foreground"
          onClick={(e) => e.stopPropagation()}
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-5 pt-5 text-left">
            <DialogTitle className="flex items-center gap-2 text-base">
               <GoogleSheetsLogo className="size-5" />
               Google Sheets
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure the Google Sheets action parameters.
            </DialogDescription>
          </DialogHeader>
          
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
            <GoogleSheetsConfigForm
              draft={draft}
              credentials={credentialsQuery.data ?? []}
              sheets={sheetsQuery.data ?? []}
              columns={columnsQuery.data ?? []}
              sheetsLoading={sheetsQuery.isLoading}
              columnsLoading={columnsQuery.isLoading}
              onDraftChange={(patch) => dispatch({ type: "set", payload: patch })}
              onConnectAccount={() => setCredentialsOpen(true)}
              onPickSpreadsheet={onPickSpreadsheet}
              onTestConnection={onTestConnection}
              testingConnection={testCredential.isPending}
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

      <GoogleSheetsCredentialsDialog
        orgId={DEFAULT_ORG_ID}
        open={credentialsOpen}
        onOpenChange={setCredentialsOpen}
        onCreated={() => {
          awaitingNewCredential.current = true;
          queryClient.invalidateQueries({ queryKey: ["integrations", "google-sheets", "credentials", DEFAULT_ORG_ID] });
        }}
      />

      <GoogleSpreadsheetPicker
        open={pickerOpen}
        onOpenChange={onPickerClose}
        getAccessToken={onGetSpreadsheetPickerAccessToken}
        onPick={onPickerResult}
      />
    </>
  );
}
