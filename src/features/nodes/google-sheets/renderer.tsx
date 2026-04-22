import { useReducer, useState, useEffect, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [draft, dispatch] = useReducer(googleSheetsConfigReducer, createGoogleSheetsConfigDraft(data));

  const credentialsQuery = useGoogleSheetsCredentials(DEFAULT_ORG_ID);
  
  const awaitingNewCredential = useRef(false);
  const prevCredentialCount = useRef(credentialsQuery.data?.length ?? 0);

  useEffect(() => {
    if (selected && !pickerOpen) {
      dispatch({ type: "reset", payload: createGoogleSheetsConfigDraft(data) });
    }
  }, [selected, data, pickerOpen]);

  useEffect(() => {
    const creds = credentialsQuery.data ?? [];
    if (awaitingNewCredential.current && creds.length > prevCredentialCount.current) {
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

  const configActive = selected || pickerOpen;

  const sheetsQuery = useGoogleSheets(
    DEFAULT_ORG_ID,
    configActive && draft.credentialId && draft.credentialId !== "__none" ? draft.credentialId : undefined,
    configActive ? draft.spreadsheetId || undefined : undefined
  );

  const columnsQuery = useGoogleSheetsColumns(
    DEFAULT_ORG_ID,
    configActive && draft.credentialId && draft.credentialId !== "__none" ? draft.credentialId : undefined,
    configActive ? draft.spreadsheetId || undefined : undefined,
    configActive ? draft.sheetId || undefined : undefined
  );

  const testCredential = useTestGoogleSheetsCredential(DEFAULT_ORG_ID);
  const pickerAccessToken = useGoogleSheetsAccessToken(DEFAULT_ORG_ID);

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

  const onPickSpreadsheet = () => {
    setPickerOpen(true);
  };

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
  };

  const onPickerClose = (open: boolean) => {
    if (!open) {
      setPickerOpen(false);
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
                      <GoogleSheetsLogo className="size-4" />
                  </div>
                  <span className="text-sm font-semibold truncate text-foreground leading-none pr-1">Google Sheets</span>
              </div>

              <div className="min-w-0 flex flex-col mt-0.5">
                  <div className="bg-black/5 dark:bg-black/20 rounded-md p-2 border border-[var(--border-dim)] mt-0.5">
                        <span className="text-[11px] text-foreground/70 line-clamp-3 leading-snug whitespace-pre-wrap">
                            {getActionLabel()}
                        </span>
                    </div>
                  
                  {isConfigured && (
                      <div className="text-[9px] text-muted-foreground tracking-wide mt-1 max-w-full truncate">
                          &#91; {data.spreadsheetName}{data.sheetName ? ` - ${data.sheetName}` : ""} &#93;
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
      {selected && !pickerOpen && (
          <div 
              className="absolute top-0 left-[230px] w-[380px] bg-[var(--node-bg)] border border-[var(--border-dim)] rounded-xl shadow-2xl z-[100] cursor-auto nodrag nopan flex flex-col overflow-hidden"
          >
              <div className="flex items-center justify-between border-b border-[var(--border-dim)] px-4 py-3 bg-muted/20">
                  <div className="flex items-center gap-2">
                      <GoogleSheetsLogo className="size-4 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configure Google Sheets</span>
                  </div>
              </div>
              
              <div className="flex-1 max-h-[500px] overflow-y-auto custom-scrollbar p-4 text-foreground">
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

      {/* Global Modals */}
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
    </div>
  );
}
