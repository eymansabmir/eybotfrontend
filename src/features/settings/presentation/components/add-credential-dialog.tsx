import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Bot, MessageSquare, Brain, Database, FileText, Globe, Music, BarChart } from "lucide-react";

// Import existing credential dialogs
import { WhatsAppCredentialsDialog } from "@/features/integrations/whatsapp/presentation/whatsapp-credentials-dialog";
import { OpenAICredentialsDialog } from "@/features/integrations/openai/presentation/openai-credentials-dialog";
import { DeepSeekCredentialsDialog } from "@/features/integrations/deepseek/presentation/deepseek-credentials-dialog";
import { AnthropicCredentialsDialog } from "@/features/integrations/anthropic/presentation/anthropic-credentials-dialog";
import { ElevenLabsCredentialsDialog } from "@/features/integrations/elevenlabs/presentation/elevenlabs-credentials-dialog";
import { GoogleSheetsCredentialsDialog } from "@/features/integrations/google-sheets/presentation/google-sheets-credentials-dialog";
import { NocoDBCredentialDialog } from "@/features/integrations/nocodb/presentation/nocodb-credentials-dialog";
import { HttpRequestCredentialsDialog } from "@/features/integrations/http-request/presentation/http-request-credentials-dialog";

import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";

interface AddCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const integrationTypes = [
  { id: "WHATSAPP", name: "WhatsApp (Meta)", icon: MessageSquare, description: "Connect your WhatsApp Business account" },
  { id: "OPENAI", name: "OpenAI", icon: Brain, description: "Connect GPT-4, GPT-3.5 and DALL-E" },
  { id: "ANTHROPIC", name: "Anthropic", icon: Bot, description: "Connect Claude 3 models" },
  { id: "DEEPSEEK", name: "DeepSeek", icon: BarChart, description: "Connect DeepSeek AI models" },
  { id: "GOOGLE_SHEETS", name: "Google Sheets", icon: FileText, description: "Read and write data to spreadsheets" },
  { id: "ELEVENLABS", name: "ElevenLabs", icon: Music, description: "Text-to-speech AI voices" },
  { id: "NOCODB", name: "NocoDB", icon: Database, description: "Airtable alternative database" },
  { id: "HTTP_REQUEST", name: "HTTP Request", icon: Globe, description: "Connect to any external API" },
];

export function AddCredentialDialog({ open, onOpenChange }: AddCredentialDialogProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: string) => {
    setSelectedType(type);
    onOpenChange(false);
  };

  const closeSpecificDialog = () => setSelectedType(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Credential</DialogTitle>
            <DialogDescription>
              Select an integration to add a new credential.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {integrationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-all text-left"
              >
                <div className="rounded-lg bg-muted p-2 mt-1">
                  <type.icon className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">{type.name}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Specific Credential Dialogs */}
      <WhatsAppCredentialsDialog 
        open={selectedType === "WHATSAPP"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <OpenAICredentialsDialog 
        open={selectedType === "OPENAI"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <AnthropicCredentialsDialog 
        open={selectedType === "ANTHROPIC"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <DeepSeekCredentialsDialog 
        open={selectedType === "DEEPSEEK"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <ElevenLabsCredentialsDialog 
        open={selectedType === "ELEVENLABS"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <GoogleSheetsCredentialsDialog 
        open={selectedType === "GOOGLE_SHEETS"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <NocoDBCredentialDialog 
        open={selectedType === "NOCODB"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
      <HttpRequestCredentialsDialog 
        open={selectedType === "HTTP_REQUEST"} 
        onOpenChange={(val) => !val && closeSpecificDialog()} 
        orgId={DEFAULT_ORG_ID} 
      />
    </>
  );
}
