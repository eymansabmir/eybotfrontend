import { useEffect, useState, useCallback } from "react";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { googleSheetsApi } from "../../api/google-sheets.api";
import { GoogleSheetsLogo } from "@/features/nodes/google-sheets/logo";

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface GoogleSpreadsheetPickerProps {
  orgId: string;
  credentialId: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  onSpreadsheetSelect: (spreadsheetId: string, spreadsheetName: string) => void;
}

function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.getElementById(id);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.type = "text/javascript";
    script.src = src;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function GoogleSpreadsheetPicker({
  orgId,
  credentialId,
  spreadsheetId,
  spreadsheetName,
  onSpreadsheetSelect,
}: GoogleSpreadsheetPickerProps) {
  const [isPickerReady, setIsPickerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadScript("gapi", "https://apis.google.com/js/api.js").then(() => {
      window.gapi.load("picker", () => {
        setIsPickerReady(true);
      });
    });
  }, []);

  const openPicker = useCallback(async () => {
    if (!isPickerReady) {
      toast.error("Google Picker is still loading...");
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = await googleSheetsApi.getAccessToken(orgId, credentialId);
      const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

      if (!apiKey) {
        toast.error("Google Sheets API key not configured");
        return;
      }

      const view = new window.google.picker.View(
        window.google.picker.ViewId.SPREADSHEETS
      );
      view.setMimeTypes("application/vnd.google-apps.spreadsheet");

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setCallback((data: { action: string; docs: { id: string; name: string }[] }) => {
          if (data.action === "picked") {
            const doc = data.docs[0];
            if (doc) {
              onSpreadsheetSelect(doc.id, doc.name);
            }
          }
        })
        .build();

      picker.setVisible(true);
    } catch (err) {
      toast.error("Failed to open spreadsheet picker");
    } finally {
      setIsLoading(false);
    }
  }, [isPickerReady, orgId, credentialId, onSpreadsheetSelect]);

  // If a spreadsheet is already selected, show its name with a change button
  if (spreadsheetId && spreadsheetName) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border bg-card p-2">
        <div className="flex items-center gap-2 min-w-0">
          <GoogleSheetsLogo className="size-4 shrink-0" />
          <span className="text-xs font-medium truncate">{spreadsheetName}</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="size-7 shrink-0"
          onClick={(e) => { e.preventDefault(); openPicker(); }}
          disabled={!isPickerReady || isLoading}
          title="Pick another spreadsheet"
        >
          <RefreshCw className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full h-9 gap-2 text-xs"
      onClick={(e) => { e.preventDefault(); openPicker(); }}
      disabled={!isPickerReady || isLoading}
    >
      <FileSpreadsheet className="size-3.5" />
      {isLoading ? "Loading..." : "Pick a spreadsheet"}
    </Button>
  );
}
