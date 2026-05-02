import { useState } from "react";
import { 
  Key, 
  Loader2, 
  Upload, 
  Shield, 
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadFile, useCreateCredential } from "../../../api/voice-tech-queries";

const ORG_ID = "tenant-ey-001";
const VOICE_CRED_TYPES = ["ELEVENLABS", "SARVAM", "VAPI", "EXOTEL"];

interface VendorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function VendorForm({ onSuccess, onCancel }: VendorFormProps) {
  const createCredential = useCreateCredential();
  const uploadFile = useUploadFile();

  const [formData, setFormData] = useState({
    name: "",
    type: "ELEVENLABS",
    apiKey: "",
    apiSid: "",
    subdomain: "",
    logoUrl: ""
  });

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile.mutate(file, {
      onSuccess: (data) => {
        setFormData({ ...formData, logoUrl: data.url });
      }
    });
  };

  const handleSubmit = () => {
    const secret: any = { apiKey: formData.apiKey };
    if (formData.type === "EXOTEL") {
      secret.apiSid = formData.apiSid;
      secret.subdomain = formData.subdomain;
    }

    createCredential.mutate({
      orgId: ORG_ID,
      name: formData.name,
      type: formData.type,
      secret,
      metadata: { logoUrl: formData.logoUrl },
      isActive: true,
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  const isFormValid = formData.name && formData.apiKey;

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Friendly Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
            Friendly Name
          </Label>
          <Input
            id="name"
            placeholder="e.g., ElevenLabs Production"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 rounded-lg bg-background border-border focus-visible:ring-1 focus-visible:ring-primary font-medium"
          />
        </div>

        {/* Provider Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
            Provider Type
          </Label>
          <Select
            value={formData.type}
            onValueChange={(v) => setFormData({ ...formData, type: v })}
          >
            <SelectTrigger className="h-11 rounded-lg bg-background border-border focus:ring-1 focus:ring-primary">
              <SelectValue placeholder="Select provider type" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border-border shadow-xl">
              {VOICE_CRED_TYPES.map(t => (
                <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Key / Secret */}
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
            API Key / Secret
          </Label>
          <div className="relative">
            <Input 
              id="apiKey" 
              type="password"
              placeholder="Enter secret key..." 
              value={formData.apiKey}
              onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
              className="h-11 rounded-lg bg-background border-border focus-visible:ring-1 focus-visible:ring-primary font-mono"
            />
            <Key className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          </div>
        </div>

        {/* Logo URL / Upload */}
        <div className="space-y-2">
          <Label htmlFor="logoUrl" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
            Logo URL / Upload
          </Label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input 
                id="logoUrl" 
                placeholder="Enter logo URL or upload ..." 
                value={formData.logoUrl}
                onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                className="h-11 rounded-lg bg-background border-border focus-visible:ring-1 focus-visible:ring-primary"
              />
              {formData.logoUrl && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 size-8 rounded-lg overflow-hidden border bg-muted shadow-sm">
                  <img src={formData.logoUrl} className="size-full object-cover" alt="Preview" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-lg h-11 w-11 shrink-0 relative bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 transition-all"
              disabled={uploadFile.isPending}
              type="button"
            >
              {uploadFile.isPending ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={handleUploadLogo}
              />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground ml-1 flex items-center gap-1.5">
            <AlertTriangle className="size-3" />
            Optional: Provide a direct image link or click the icon to upload.
          </p>
        </div>

        {/* Exotel Specific Fields */}
        {formData.type === "EXOTEL" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <Label htmlFor="apiSid" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
                Account SID
              </Label>
              <Input
                id="apiSid"
                placeholder="Exotel Account SID"
                value={formData.apiSid}
                onChange={(e) => setFormData({ ...formData, apiSid: e.target.value })}
                className="h-11 rounded-lg bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain" className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground ml-1">
                Subdomain
              </Label>
              <Input
                id="subdomain"
                placeholder="api.exotel.com"
                value={formData.subdomain}
                onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                className="h-11 rounded-lg bg-background border-border"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-border flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onCancel}
          className="h-11 px-8 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          Cancel
        </Button>
        <div className="flex-1" />
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || createCredential.isPending}
          className="gap-2 h-11 px-10 rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20 font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {createCredential.isPending ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />}
          Save Credential
        </Button>
      </div>
    </div>
  );
}
