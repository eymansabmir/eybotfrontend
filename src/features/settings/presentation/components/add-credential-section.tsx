import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft,
  Key,
  CircleHelp,
  Loader2,
  ExternalLink,
  MessageSquare,
  Brain,
  Bot,
  BarChart,
  FileText,
  Music,
  Database,
  Globe
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ENV } from "@/config/env";

// Hooks for creation
import { useCreateOpenAICredential } from "@/features/integrations/openai/hooks/use-openai-integration";
import { useCreateAnthropicCredential } from "@/features/integrations/anthropic/hooks/use-anthropic-integration";
import { useCreateDeepSeekCredential } from "@/features/integrations/deepseek/hooks/use-deepseek-integration";
import { useCreateElevenLabsCredential } from "@/features/integrations/elevenlabs/hooks/use-elevenlabs-integration";
import { useCreateNocoDBCredential } from "@/features/integrations/nocodb/hooks/use-nocodb-integration";
import { useCreateHttpRequestCredential } from "@/features/integrations/http-request/hooks/use-http-request-integration";

// APIs for specialized flows
import { googleSheetsApi } from "@/features/integrations/google-sheets/api/google-sheets.api";

// Specialized Dialogs (for multi-step flows like WhatsApp)
import { WhatsAppCredentialsDialog } from "@/features/integrations/whatsapp/presentation/whatsapp-credentials-dialog";

import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { ProviderLogo } from "@/components/brand-logos";

const integrationTypes = [
  { id: "WHATSAPP", name: "WhatsApp (Meta)", description: "Connect your WhatsApp Business account", icon: MessageSquare },
  { id: "OPENAI", name: "OpenAI", description: "Connect GPT-4, GPT-3.5 and DALL-E", icon: Brain },
  { id: "ANTHROPIC", name: "Anthropic", description: "Connect Claude 3 models", icon: Bot },
  { id: "DEEPSEEK", name: "DeepSeek", description: "Connect DeepSeek AI models", icon: BarChart },
  { id: "GOOGLE_SHEETS", name: "Google Sheets", description: "Read and write data to spreadsheets", icon: FileText },
  { id: "ELEVENLABS", name: "ElevenLabs", description: "Text-to-speech AI voices", icon: Music },
  { id: "NOCODB", name: "NocoDB", description: "Airtable alternative database", icon: Database },
  { id: "HTTP_REQUEST", name: "HTTP Request", description: "Connect to any external API", icon: Globe },
];

export function AddCredentialSection() {
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [mode, setMode] = useState<"selecting" | "configuring">("selecting");
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  
  // Form States
  const [name, setName] = useState("My account");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  
  const navigate = useNavigate();

  // Mutations
  const createOpenAI = useCreateOpenAICredential(DEFAULT_ORG_ID);
  const createAnthropic = useCreateAnthropicCredential(DEFAULT_ORG_ID);
  const createDeepSeek = useCreateDeepSeekCredential(DEFAULT_ORG_ID);
  const createElevenLabs = useCreateElevenLabsCredential(DEFAULT_ORG_ID);
  const createNocoDB = useCreateNocoDBCredential(DEFAULT_ORG_ID);
  const createHttpRequest = useCreateHttpRequestCredential(DEFAULT_ORG_ID);

  const handleContinue = () => {
    if (selectedType) {
      if (selectedType === "WHATSAPP") {
        setIsWhatsAppOpen(true);
      } else {
        setMode("configuring");
      }
    }
  };

  const handleBack = () => {
    if (mode === "configuring") {
      setMode("selecting");
    } else {
      void navigate({ to: "/settings/credentials" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Label is required");
    if (!apiKey.trim() && selectedType !== "GOOGLE_SHEETS") return toast.error("API Key is required");

    try {
      switch (selectedType) {
        case "OPENAI":
          await createOpenAI.mutateAsync({ name, apiKey, baseUrl: baseUrl || undefined });
          break;
        case "ANTHROPIC":
          await createAnthropic.mutateAsync({ name, apiKey });
          break;
        case "DEEPSEEK":
          await createDeepSeek.mutateAsync({ name, apiKey });
          break;
        case "ELEVENLABS":
          await createElevenLabs.mutateAsync({ name, apiKey });
          break;
        case "NOCODB":
          await createNocoDB.mutateAsync({ name, apiKey, baseUrl });
          break;
        case "HTTP_REQUEST":
          await createHttpRequest.mutateAsync({ name, bearerToken: apiKey, baseUrl });
          break;
        default:
          return;
      }
      toast.success("Credential created successfully");
      void navigate({ to: "/settings/credentials" });
    } catch (error) {
      toast.error("Failed to create credential");
    }
  };

  // Google Sheets OAuth Logic
  const expectedMessageOrigin = new URL(ENV.API_URL, window.location.origin).origin;
  
  const handleGoogleSignIn = useCallback(async () => {
    try {
      const authUrl = await googleSheetsApi.getAuthUrl(DEFAULT_ORG_ID);
      window.open(authUrl, "google-sheets-auth", "width=500,height=600,left=200,top=100");
    } catch {
      toast.error("Failed to get authentication URL");
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== expectedMessageOrigin) return;
      if (event.data === "google-sheets-oauth-success") {
        toast.success("Google account connected successfully!");
        void navigate({ to: "/settings/credentials" });
      } else if (event.data === "google-sheets-oauth-failure") {
        toast.error("Google authentication failed.");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [expectedMessageOrigin, navigate]);

  const currentIntegration = integrationTypes.find(t => t.id === selectedType);

  return (
    <div className="space-y-8 pb-20 max-w-2xl">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
          <Key className="size-3.5" />
          Settings
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="rounded-full bg-card border border-border shadow-sm hover:bg-muted shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              SETTINGS <span className="mx-2 text-muted-foreground/30">›</span> CREDENTIALS <span className="mx-2 text-muted-foreground/30">›</span> {mode === "selecting" ? "NEW" : "SETUP"}
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-0.5">
              {mode === "selecting" ? "Connect New Service" : `Setup ${currentIntegration?.name}`}
            </h1>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-none bg-transparent overflow-visible">
        <CardContent className="px-0 py-0">
          {mode === "selecting" ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="provider" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Select Provider
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="provider" className="w-full h-16 text-lg rounded-2xl border-border bg-card shadow-sm hover:border-primary/50 transition-all px-5">
                    <SelectValue placeholder="Choose an integration...">
                      {selectedType && currentIntegration && (
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-muted p-1.5 transition-colors">
                            <ProviderLogo type={selectedType} className="size-5" />
                          </div>
                          <span>{currentIntegration.name}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" sideOffset={5} className="rounded-2xl shadow-2xl border-border p-2 animate-in fade-in zoom-in-95 duration-200 max-h-[300px] w-[var(--radix-select-trigger-width)]">
                    {integrationTypes.map((type) => (
                      <SelectItem 
                        key={type.id} 
                        value={type.id} 
                        className="py-4 rounded-xl focus:bg-primary/5 cursor-pointer px-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 border border-muted-foreground/10 group-focus:scale-110 transition-transform">
                            <ProviderLogo type={type.id} className="size-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{type.name}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">{type.description}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button 
                  className="h-12 px-10 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  disabled={!selectedType}
                  onClick={handleContinue}
                >
                  Continue to Setup
                </Button>
              </div>
            </div>
          ) : (
            selectedType === "GOOGLE_SHEETS" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-muted/30 rounded-2xl p-6 border border-dashed border-muted-foreground/20 text-center space-y-4">
                  <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
                    <ExternalLink className="size-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">Google OAuth Required</p>
                    <p className="text-sm text-muted-foreground">
                      Google Sheets requires secure authentication via Google. Click below to sign in and authorize access.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleGoogleSignIn}
                  className="h-12 px-10 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all bg-card border border-border text-foreground hover:bg-muted"
                >
                  <svg className="size-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                    Label
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My account"
                    className="h-14 text-base rounded-2xl border-border bg-card shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">API key / Token</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your key..."
                    className="h-14 text-base rounded-2xl border-border bg-card shadow-sm"
                  />
                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-1 ml-1">
                    <CircleHelp className="size-3" /> Refer to provider documentation to obtain your key.
                  </p>
                </div>

                {(selectedType === "OPENAI" || selectedType === "DEEPSEEK" || selectedType === "NOCODB" || selectedType === "HTTP_REQUEST") && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Base URL (Optional)</Label>
                    <Input
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder={selectedType === "OPENAI" ? "https://api.openai.com/v1" : "https://..."}
                      className="h-14 text-base rounded-2xl border-border bg-card shadow-sm"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="h-12 px-10 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                    disabled={createOpenAI.isPending || createAnthropic.isPending}
                  >
                    {(createOpenAI.isPending || createAnthropic.isPending) ? (
                      <><Loader2 className="size-5 animate-spin mr-2" /> Connecting...</>
                    ) : "Establish Connection"}
                  </Button>
                </div>
              </form>
            )
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground px-10">
        Your credentials are encrypted and stored securely. We never share your API keys with third parties.
      </p>

      {/* Specific Dialogs for multi-step flows */}
      <WhatsAppCredentialsDialog 
        open={isWhatsAppOpen} 
        onOpenChange={setIsWhatsAppOpen} 
        orgId={DEFAULT_ORG_ID} 
        onNewCredentials={() => {
            setIsWhatsAppOpen(false);
            void navigate({ to: "/settings/credentials" });
        }}
      />
    </div>
  );
}
