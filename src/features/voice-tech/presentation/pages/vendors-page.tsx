import { useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  ShieldCheck, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  Shield,
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredentials, useCreateCredential } from "../../api/voice-tech-queries";
import { PROVIDER_META, type VoiceProvider } from "../../types";
import { format } from "date-fns";

const ORG_ID = "tenant-ey-001";
const VOICE_CRED_TYPES = ["ELEVENLABS", "SARVAM", "VAPI", "EXOTEL"];

export function VendorsPage() {
  const { data: credentials = [], isLoading } = useCredentials(ORG_ID);
  const createCredential = useCreateCredential();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    type: "ELEVENLABS",
    apiKey: "",
    apiSid: "",
    subdomain: ""
  });

  const voiceVendors = credentials.filter(c => VOICE_CRED_TYPES.includes(c.type));

  const handleCreate = () => {
    const secret: any = { apiKey: newVendor.apiKey };
    if (newVendor.type === "EXOTEL") {
      secret.apiSid = newVendor.apiSid;
      secret.subdomain = newVendor.subdomain;
    }

    createCredential.mutate({
      orgId: ORG_ID,
      name: newVendor.name,
      type: newVendor.type,
      secret,
      isActive: true,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setNewVendor({ name: "", type: "ELEVENLABS", apiKey: "", apiSid: "", subdomain: "" });
      }
    });
  };

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto px-4 sm:px-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="size-3.5" />
              Security & Access
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Voice Vendors</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Securely manage API credentials for your telephony and voice intelligence providers.
            </p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
          <Plus className="size-4" />
          Add Vendor
        </Button>
      </div>

      {/* ── Grid ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading credentials...</p>
        </div>
      ) : voiceVendors.length === 0 ? (
        <EmptyState onAdd={() => setIsAddOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {voiceVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}

      {/* ── Add Dialog ─────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Key className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold">Add New Vendor</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-1">
              Configure a new voice service provider to use in your orchestrations.
            </DialogDescription>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Friendly Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., ElevenLabs Production" 
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Provider Type</Label>
                <Select 
                  value={newVendor.type} 
                  onValueChange={(v) => setNewVendor({...newVendor, type: v})}
                >
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {VOICE_CRED_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key / Secret</Label>
                <Input 
                  id="apiKey" 
                  type="password"
                  placeholder="Enter secret key..." 
                  value={newVendor.apiKey}
                  onChange={(e) => setNewVendor({...newVendor, apiKey: e.target.value})}
                  className="rounded-xl"
                />
              </div>

              {newVendor.type === "EXOTEL" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="apiSid">Account SID</Label>
                    <Input 
                      id="apiSid" 
                      placeholder="Exotel Account SID" 
                      value={newVendor.apiSid}
                      onChange={(e) => setNewVendor({...newVendor, apiSid: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input 
                      id="subdomain" 
                      placeholder="api.exotel.com" 
                      value={newVendor.subdomain}
                      onChange={(e) => setNewVendor({...newVendor, subdomain: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t gap-2">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl">Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={!newVendor.name || !newVendor.apiKey || createCredential.isPending}
              className="rounded-xl px-8"
            >
              {createCredential.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Shield className="size-4 mr-2" />}
              Save Credential
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: any }) {
  const meta = PROVIDER_META[vendor.type.toLowerCase() as VoiceProvider] || { label: vendor.type, color: "#94a3b8" };
  
  return (
    <Card className="overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-xl transition-all duration-300 group bg-card/50 backdrop-blur-sm">
      <div className="h-1.5 w-full" style={{ backgroundColor: meta.color }} />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5">
        <div className="flex items-center gap-3">
          <div 
            className="size-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: meta.color }}
          >
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold truncate max-w-[150px]">{vendor.name}</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider">{meta.label}</CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem className="gap-2">
              <ExternalLink className="size-4" />
              Test Connection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive gap-2">
              <Trash2 className="size-4" />
              Delete Vendor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-5 pt-0 space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg font-mono">
          <Key className="size-3.5" />
          <span>••••••••••••••••</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            {vendor.isActive ? (
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 px-2">
                <CheckCircle2 className="size-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 px-2">
                <AlertCircle className="size-3" />
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium">
            Added {format(new Date(vendor.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5 border-border/60 text-center px-4">
      <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/20">
        <Shield className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Secure Your Voice Stack</h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        You haven't added any voice provider credentials yet. Connect ElevenLabs, Sarvam, or Vapi to start orchestrating.
      </p>
      <Button onClick={onAdd} className="gap-2 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 text-base">
        <Plus className="size-5" />
        Add First Vendor
      </Button>
    </div>
  );
}

