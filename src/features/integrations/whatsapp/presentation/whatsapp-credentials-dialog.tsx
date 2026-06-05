import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Check, Copy, ChevronRight, ChevronLeft, Bot, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateWhatsAppCredential } from "../hooks/use-whatsapp-credentials";
import { whatsappCredentialsApi } from "../api/whatsapp-credentials.api";

type ApiLikeError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  const candidate = error as ApiLikeError;
  return candidate?.response?.data?.message || candidate?.message || fallback;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  onNewCredentials?: (id: string) => void;
};

const metaSteps = [
  { title: "Requirements" },
  { title: "User Token" },
  { title: "Phone Number" },
  { title: "Webhook" },
];

export function WhatsAppCredentialsDialog({ open, onOpenChange, orgId, onNewCredentials }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [accessToken, setAccessToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [phoneNumberName, setPhoneNumberName] = useState("");
  const [whatsappBusinessAccountId, setWhatsappBusinessAccountId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [dynamicWebhookUrl, setDynamicWebhookUrl] = useState<string | null>(null);
  const [fallbackWebhookUrl, setFallbackWebhookUrl] = useState<string | null>(null);
  const [isVerifyTokenConfigured, setIsVerifyTokenConfigured] = useState<boolean>(true);

  // Auto-fetched from Meta API
  const [resolvedPhoneNumber, setResolvedPhoneNumber] = useState<string | null>(null);
  const [resolvedVerifiedName, setResolvedVerifiedName] = useState<string | null>(null);
  
  const createMutation = useCreateWhatsAppCredential(orgId);

  // We construct webhook url from the environment running locally/prod
  const webhookUrl = dynamicWebhookUrl || `${window.location.origin}/api/webhooks/whatsapp`;
  const verificationTokenHint = "Use backend WHATSAPP_VERIFY_TOKEN value";

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadWebhookConfig = async () => {
      try {
        const config = await whatsappCredentialsApi.getWebhookConfig();
        if (cancelled) return;
        setDynamicWebhookUrl(config.callbackUrl);
        setFallbackWebhookUrl(config.fallbackCallbackUrl);
        setIsVerifyTokenConfigured(config.verifyTokenConfigured);
      } catch {
        if (cancelled) return;
        setDynamicWebhookUrl(`${window.location.origin}/api/webhooks/whatsapp`);
        setFallbackWebhookUrl(null);
      }
    };

    loadWebhookConfig();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const resetForm = () => {
    setActiveStep(0);
    setAccessToken("");
    setPhoneNumberId("");
    setPhoneNumberName("");
    setWhatsappBusinessAccountId("");
    setValidationError(null);
    setIsVerifying(false);
    setResolvedPhoneNumber(null);
    setResolvedVerifiedName(null);
  };

  /**
   * Validates the token format at step 1.
   */
  const validateToken = (): boolean => {
    const trimmedToken = accessToken.trim();
    if (!trimmedToken) {
      setValidationError("Access token is required.");
      toast.error("Access token is required.");
      return false;
    }
    if (!trimmedToken.startsWith("EA")) {
      setValidationError("Token looks invalid. Meta tokens typically start with 'EA'.");
      toast.error("Token looks invalid. Meta tokens typically start with 'EA'.");
      return false;
    }
    if (trimmedToken.length < 20) {
      setValidationError("Token is too short. Please paste the full token.");
      toast.error("Token is too short. Please paste the full token.");
      return false;
    }
    return true;
  };

  /**
   * Validates the phone number ID at step 2 by calling Meta's Graph API
   * through our backend proxy. This is the autobot approach — we resolve
   * the actual display phone number from the API, not from user input.
   */
  const validateAndFetchPhoneNumber = async (): Promise<boolean> => {
    const trimmedPhoneId = phoneNumberId.trim();
    if (!trimmedPhoneId) {
      setValidationError("Phone number ID is required.");
      toast.error("Phone number ID is required.");
      return false;
    }
    if (!/^\d{10,}$/.test(trimmedPhoneId)) {
      setValidationError("Phone number ID must be a numeric string of at least 10 digits.");
      toast.error("Phone number ID must be a numeric string (e.g., 986914541176866).");
      return false;
    }

    // Call Meta API to verify credentials and resolve the actual phone number
    setIsVerifying(true);
    try {
      const result = await whatsappCredentialsApi.getPhoneNumber(
        accessToken.trim(),
        trimmedPhoneId,
      );

      setResolvedPhoneNumber(result.displayPhoneNumber);
      setResolvedVerifiedName(result.verifiedName);

      // Auto-fill the account name from Meta's verified name if user hasn't set one
      if (!phoneNumberName.trim() && result.verifiedName) {
        setPhoneNumberName(result.verifiedName);
      }

      toast.success(`Phone number verified: ${result.formattedPhoneNumber}`);
      return true;
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, "Could not verify phone number ID with Meta. Check your token and phone number ID.");
      setValidationError(errorMessage);
      toast.error(errorMessage);
      console.error("[Meta API Validation Error]", err);
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const goToNextStep = async () => {
    setValidationError(null);

    // Step 1 → 2: Validate token format
    if (activeStep === 1) {
      if (!validateToken()) return;
    }

    // Step 2 → 3: Validate phone number ID via Meta API
    if (activeStep === 2) {
      const isValid = await validateAndFetchPhoneNumber();
      if (!isValid) return;
    }

    // Step 3 (Webhook) → Submit
    if (activeStep === metaSteps.length - 1) {
      try {
        const credential = await createMutation.mutateAsync({
          name: phoneNumberName.trim() || "WhatsApp Bot",
          accessToken: accessToken.trim(),
          phoneNumberId: phoneNumberId.trim(),
          displayPhoneNumber: resolvedPhoneNumber || undefined,
          whatsappBusinessAccountId: whatsappBusinessAccountId.trim() || undefined,
        });
        toast.success("WhatsApp account connected successfully!");
        onNewCredentials?.(credential.id);
        onOpenChange(false);
        resetForm();
      } catch (err: unknown) {
        const backendMessage = getErrorMessage(err, "Failed to create WhatsApp credential");
        if (backendMessage?.includes("already exists")) {
          setValidationError("A credential with this name already exists. Use a different Account Name.");
        } else {
          console.error("[WhatsApp Credential Creation Error]", backendMessage);
        }
      }
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const goToPrevious = () => {
    setValidationError(null);
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const CopyField = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-2 w-full mt-4 bg-muted/30 p-3 rounded-lg border">
      <Label className="text-muted-foreground uppercase text-[10px] tracking-wider">{label}</Label>
      <div className="flex items-center">
        <code className="flex-1 font-mono text-sm max-w-50 truncate sm:max-w-md">{value}</code>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 shrink-0" 
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
          }}
        >
          <Copy className="size-3.5 mr-1" /> Copy
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) setTimeout(resetForm, 300);
    }}>
      <DialogContent className="sm:max-w-4xl w-[95vw] border-none shadow-2xl p-0 gap-0 overflow-hidden sm:rounded-2xl max-h-[90dvh] flex flex-col">
        <DialogHeader className="p-6 bg-muted/40 border-b relative shrink-0">
          {activeStep > 0 && (
              <Button variant="ghost" size="icon" onClick={goToPrevious} className="absolute left-4 top-4 size-8 rounded-full">
                  <ChevronLeft className="size-5" />
              </Button>
          )}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="flex items-center gap-3">
               <div className="grid size-9 place-items-center rounded-xl bg-(--ey-yellow) text-black">
                 <Bot className="size-5" />
              </div>
              <DialogTitle className="text-xl">Add Meta WhatsApp number</DialogTitle>
            </div>
            
            <div className="flex items-center gap-1 w-full max-w-3xl mt-6 px-2 mx-auto sm:px-6 mb-2">
              {metaSteps.map((step, index) => (
                <div key={index} className="flex items-center flex-1 last:flex-none pr-2">
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors shrink-0
                        ${index < activeStep ? "bg-(--ey-yellow) text-black" : 
                          index === activeStep ? "bg-primary text-primary-foreground border-2 border-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {index < activeStep ? <Check className="size-3.5" /> : index + 1}
                    </div>
                    <p className={`text-sm font-medium whitespace-nowrap hidden sm:block transition-colors ${index <= activeStep ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.title}
                    </p>
                    {index !== metaSteps.length - 1 && <div className="h-0.5 w-full bg-border mr-2 ml-1 opacity-60" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pb-8 min-h-75 overflow-y-auto flex-1 custom-scrollbar">
             {/* Validation Error Banner */}
             {validationError && (
               <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                 <AlertCircle className="size-4 shrink-0 mt-0.5" />
                 <span>{validationError}</span>
               </div>
             )}

             {activeStep === 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <p className="text-base">
                    Ensure you have <a href="https://developers.facebook.com/apps/" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">created a WhatsApp Meta app <ExternalLink className="size-3" /></a>
                  </p>
                  <p className="text-muted-foreground text-sm">You should be able to get to this quickstart page:</p>
                  <div className="rounded-xl border shadow-sm overflow-hidden bg-background">
                     <img src="/images/whatsapp-quickstart-page.png" alt="WhatsApp Quickstart Overview" className="w-full h-auto" />
                  </div>
                </div>
             )}

             {activeStep === 1 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                  <ol className="list-decimal pl-5 space-y-4 text-sm marker:text-muted-foreground">
                    <li>
                      Go to your <a href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">System users page</a>
                    </li>
                    <li>
                      Create a new user by clicking on <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Add</strong>
                    </li>
                    <li>
                      Fill it with any name and give it the <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Admin</strong> role
                    </li>
                    <li>
                      <div className="space-y-2">
                        <p>
                          Click on <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Add assets</strong>. Under <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Apps</strong>, look for your app, select it and check <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Manage app</strong>
                        </p>
                        <img src="/images/meta-system-user-assets.png" alt="Asset assignment" className="rounded-xl border shadow-sm w-full max-w-sm mt-2" />
                      </div>
                    </li>
                    <li>
                      <p>
                        Click on <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Generate new token</strong>. Select your app.
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                        <li>Token expiration: <code className="text-foreground">Never</code></li>
                        <li>Permissions: <code className="text-foreground">whatsapp_business_messaging</code>, <code className="text-foreground">whatsapp_business_management</code></li>
                      </ul>
                    </li>
                  </ol>
                  <div className="pt-2">
                    <Label className="font-semibold text-foreground">Copy and paste the generated token</Label>
                    <Input 
                      type="password" 
                      placeholder="EAxxxx..." 
                      className={`mt-2 ${validationError && activeStep === 1 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      value={accessToken} 
                      onChange={(e) => {
                        setAccessToken(e.target.value);
                        setValidationError(null);
                      }}
                    />
                  </div>
                </div>
             )}

             {activeStep === 2 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                    <ol className="list-decimal pl-5 space-y-4 text-sm marker:text-muted-foreground">
                        <li>
                            Go to your <strong className="font-medium">WhatsApp Dev Console</strong>.
                        </li>
                        <li>
                            Add your phone number by clicking on the <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Add phone number</strong> button.
                        </li>
                        <li>
                            <div className="space-y-2">
                                <p>Select a phone number and paste the associated <strong className="font-medium bg-muted px-1.5 py-0.5 rounded text-xs">Phone number ID</strong> below:</p>
                                <img src="/images/whatsapp-phone-selection.png" alt="Phone selection" className="rounded-xl border shadow-sm w-full max-w-md mt-2 mb-4" />
                            </div>
                        </li>
                    </ol>

                    <div className="space-y-4 pt-4 border-t">
                        <div className="space-y-1.5">
                            <Label>Phone number ID</Label>
                            <Input 
                              value={phoneNumberId} 
                              onChange={(e) => {
                                setPhoneNumberId(e.target.value);
                                setValidationError(null);
                              }}
                              className={validationError && activeStep === 2 ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                            <p className="text-xs text-muted-foreground">This is the numeric ID from the Meta console — <strong>not</strong> the phone number itself.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Account Name / Label</Label>
                            <Input value={phoneNumberName} onChange={(e) => setPhoneNumberName(e.target.value)} />
                            <p className="text-xs text-muted-foreground">Auto-filled from Meta if left empty.</p>
                        </div>
                        <div className="space-y-1.5">
                            <Label>WhatsApp Business Account (WABA) ID <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span></Label>
                            <Input 
                              value={whatsappBusinessAccountId} 
                              onChange={(e) => setWhatsappBusinessAccountId(e.target.value)}
                              placeholder="e.g., 942080224962111"
                            />
                            <p className="text-xs text-muted-foreground">Directly configure this WABA ID to bypass Graph API lookups and avoid Meta permission limits.</p>
                        </div>
                    </div>

                    {/* Show resolved phone number if we have it from a previous successful validation */}
                    {resolvedPhoneNumber && (
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center gap-2 animate-in fade-in">
                        <Check className="size-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 dark:text-emerald-300">
                          Verified: <strong>{resolvedPhoneNumber}</strong>
                          {resolvedVerifiedName && <span className="text-muted-foreground"> ({resolvedVerifiedName})</span>}
                        </span>
                      </div>
                    )}
                </div>
             )}

             {activeStep === 3 && (
                <div className="space-y-5 animate-in zoom-in-95 fill-mode-both">
                    {/* Show the resolved phone number prominently */}
                    {resolvedPhoneNumber && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center gap-3">
                        <Check className="size-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-medium text-emerald-700 dark:text-emerald-300">Phone number verified</p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-mono">{resolvedPhoneNumber}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-sm">
                        In your <strong className="font-medium">WhatsApp Settings page</strong>, navigate to Configuration and click on the <strong className="font-medium">Edit</strong> button to insert the following webhook values:
                    </p>
                    
                    <div className="space-y-4">
                       <CopyField label="Callback URL" value={webhookUrl} />
                        {fallbackWebhookUrl && fallbackWebhookUrl !== webhookUrl && (
                          <CopyField label="Fallback Callback URL" value={fallbackWebhookUrl} />
                        )}
                        <CopyField label="Verify Token" value={verificationTokenHint} />
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-orange-100/50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-200 text-sm">
                        <span className="font-bold flex items-center gap-2 mb-1">
                             <Check className="size-4" />
                             Important Step
                        </span>
                        Set the same token value in Meta and in backend env as <code className="font-mono">WHATSAPP_VERIFY_TOKEN</code>. Then, next to Webhook fields: "messages", ensure you click on <strong className="font-medium border-b border-orange-900/20">Subscribe</strong> so your bot receives inbound events.
                        {!isVerifyTokenConfigured && (
                          <div className="mt-2 text-destructive font-medium">
                            Backend token is not configured yet. Set <code className="font-mono">WHATSAPP_VERIFY_TOKEN</code> before verifying webhook in Meta.
                          </div>
                        )}
                    </div>
                </div>
             )}
        </div>

        <div className="p-6 bg-muted/20 border-t flex items-center justify-between mt-auto shrink-0 z-10 w-full relative">
             <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
             <Button 
                onClick={goToNextStep} 
                disabled={
                    createMutation.isPending || 
                    isVerifying ||
                    (activeStep === 1 && !accessToken.trim()) || 
                    (activeStep === 2 && !phoneNumberId.trim())
                }
                variant={activeStep === metaSteps.length - 1 ? "ghost" : "default"}
                className={activeStep === metaSteps.length - 1 ? "w-32 border dark:border-white/20 hover:bg-muted/50" : "w-32"}
             >
                {(createMutation.isPending || isVerifying) ? (
                    <><Loader2 className="size-4 animate-spin mr-2" /> {isVerifying ? "Verifying..." : "Submitting..."}</>
                ) : activeStep === metaSteps.length - 1 ? "Finish" : (
                    <>Continue <ChevronRight className="size-4 ml-1" /></>
                )}
             </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
