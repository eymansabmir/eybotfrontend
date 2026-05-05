import { useReducer, useState, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
    <NodeFrame
        selected={selected}
        icon={<GoogleSheetsLogo className="size-4" />}
        title="Google Sheets"
        popoverTitle="Configure Google Sheets"
        summary={getActionLabel()}
        showPopover={selected && !pickerOpen}
        popoverClassName="w-[380px]"
        compactBody={
            isConfigured && (
                <div className="text-[9px] text-muted-foreground tracking-wide mt-1 max-w-full truncate">
                    &#91; {data.spreadsheetName}{data.sheetName ? ` - ${data.sheetName}` : ""} &#93;
                </div>
            )
        }
        popoverBody={
            <div className="space-y-4">
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
            <>
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
        }
    />
  );
}
