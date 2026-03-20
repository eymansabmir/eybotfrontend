import { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { googleSheetsApi } from "../api/google-sheets.api";

interface GoogleSheetsCredentialsDialogProps {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function GoogleSheetsCredentialsDialog({
  orgId,
  open,
  onOpenChange,
  onCreated,
}: GoogleSheetsCredentialsDialogProps) {

  const handleSignIn = useCallback(async () => {
    try {
      const authUrl = await googleSheetsApi.getAuthUrl(orgId);
      // Open a popup for Google OAuth
      const popup = window.open(
        authUrl,
        "google-sheets-auth",
        "width=500,height=600,left=200,top=100"
      );

      if (!popup) {
        toast.error("Popup blocked. Please allow popups for this site.");
        return;
      }
    } catch {
      toast.error("Failed to get authentication URL");
    }
  }, [orgId]);

  // Listen for auth success/failure from popup
  useEffect(() => {
    if (!open) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data === "google-sheets-oauth-success") {
        toast.success("Google account connected successfully!");
        onCreated?.();
        onOpenChange(false);
      } else if (event.data === "google-sheets-oauth-failure") {
        toast.error("Google authentication failed. Please try again.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [open, onCreated, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Connect Google Sheets</DialogTitle>
          <DialogDescription>
            Sign in with your Google account to connect Google Sheets to your bot.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleSignIn}
            className="w-full h-11 gap-3 font-medium text-sm"
            variant="outline"
          >
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            You will be redirected to Google to authorize access to your spreadsheets.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
