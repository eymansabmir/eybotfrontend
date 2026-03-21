import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { GoogleSpreadsheetInfo } from "../../domain/google-sheets.types";

const GOOGLE_API_SCRIPT_SRC = "https://apis.google.com/js/api.js";

type PickerAction = "picked" | "cancel";

declare global {
  interface Window {
    gapi?: {
      load: (
        library: string,
        callbackOrConfig:
          | (() => void)
          | {
              callback?: () => void;
              onerror?: () => void;
            },
      ) => void;
    };
    google?: {
      picker: {
        Action: { PICKED: PickerAction; CANCEL: PickerAction };
        Document: { ID: string; NAME: string };
        Response: { ACTION: string; DOCUMENTS: string };
        ViewId: { SPREADSHEETS: string };
        DocsView: new (viewId: string) => {
          setMimeTypes: (mimeTypes: string) => any;
          setIncludeFolders: (includeFolders: boolean) => any;
          setSelectFolderEnabled: (enabled: boolean) => any;
        };
        PickerBuilder: new () => {
          setDeveloperKey: (key: string) => any;
          setOAuthToken: (token: string) => any;
          addView: (view: unknown) => any;
          setOrigin: (origin: string) => any;
          setCallback: (callback: (data: Record<string, unknown>) => void) => any;
          build: () => {
            setVisible: (visible: boolean) => void;
          };
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;
let pickerModulePromise: Promise<void> | null = null;

function loadGoogleApiScript(): Promise<void> {
  if (window.gapi && window.google?.picker) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_API_SCRIPT_SRC}"]`);
    if (existingScript) {
      if (window.gapi) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google API script")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_API_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google API script"));
    document.body.appendChild(script);
  });

  return googleScriptPromise;
}

function loadPickerModule(): Promise<void> {
  if (window.google?.picker && window.gapi) {
    return Promise.resolve();
  }

  if (pickerModulePromise) {
    return pickerModulePromise;
  }

  pickerModulePromise = new Promise<void>((resolve, reject) => {
    if (!window.gapi) {
      reject(new Error("Google API client not available"));
      return;
    }

    window.gapi.load("picker", {
      callback: () => resolve(),
      onerror: () => reject(new Error("Failed to initialize Google Picker")),
    });
  });

  return pickerModulePromise;
}

interface GoogleSpreadsheetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getAccessToken: () => Promise<string>;
  onPick: (spreadsheet: GoogleSpreadsheetInfo) => void;
}

export function GoogleSpreadsheetPicker({
  open,
  onOpenChange,
  getAccessToken,
  onPick,
}: GoogleSpreadsheetPickerProps) {
  const runInFlight = useRef(false);

  // Store callbacks in refs so the effect only depends on `open`
  const getAccessTokenRef = useRef(getAccessToken);
  const onOpenChangeRef = useRef(onOpenChange);
  const onPickRef = useRef(onPick);
  getAccessTokenRef.current = getAccessToken;
  onOpenChangeRef.current = onOpenChange;
  onPickRef.current = onPick;

  useEffect(() => {
    if (!open || runInFlight.current) {
      return;
    }

    let cancelled = false;
    runInFlight.current = true;

    const openPicker = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY as string | undefined;
        if (!apiKey) {
          throw new Error("VITE_GOOGLE_SHEETS_API_KEY is missing");
        }

        const accessToken = await getAccessTokenRef.current();
        await loadGoogleApiScript();
        await loadPickerModule();

        if (cancelled || !window.google?.picker) {
          return;
        }

        const view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
          .setMimeTypes("application/vnd.google-apps.spreadsheet")
          .setIncludeFolders(false)
          .setSelectFolderEnabled(false);

        const picker = new window.google.picker.PickerBuilder()
          .setDeveloperKey(apiKey)
          .setOAuthToken(accessToken)
          .setOrigin(window.location.origin)
          .addView(view)
          .setCallback((data: Record<string, unknown>) => {
            const pickerApi = window.google?.picker;
            if (!pickerApi) return;

            const action = data[pickerApi.Response.ACTION];
            if (action === pickerApi.Action.PICKED) {
              const documents = data[pickerApi.Response.DOCUMENTS] as Array<Record<string, unknown>> | undefined;
              const first = documents?.[0];
              const id = first?.[pickerApi.Document.ID];
              const name = first?.[pickerApi.Document.NAME];

              if (typeof id === "string" && id.length > 0) {
                onPickRef.current({
                  id,
                  name: typeof name === "string" && name.length > 0 ? name : id,
                });
              } else {
                toast.error("Could not read selected spreadsheet from Google Picker");
              }
            }

            if (action === pickerApi.Action.PICKED || action === pickerApi.Action.CANCEL) {
              onOpenChangeRef.current(false);
            }
          })
          .build();

        picker.setVisible(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to open Google Picker";
        toast.error(message);
        onOpenChangeRef.current(false);
      } finally {
        runInFlight.current = false;
      }
    };

    openPicker();

    return () => {
      cancelled = true;
      runInFlight.current = false;
    };
  }, [open]);

  // No UI needed — the native Google Picker provides its own modal
  return null;
}

