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
  AlertCircle,
  Search,
  Upload,
  Bot
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  useCredentials, 
  useCreateCredential, 
  useVoiceAgents, 
  useUpsertVoiceAgent, 
  useUploadFile,
  useDeleteCredential
} from "../../api/voice-tech-queries";
import { PROVIDER_META, type VoiceProvider as VoiceProviderType, type IntegrationCredential } from "../../types";
import { format } from "date-fns";

const ORG_ID = "tenant-ey-001";
const VOICE_CRED_TYPES = ["ELEVENLABS", "SARVAM", "VAPI", "EXOTEL"];

export function VendorsPage() {
  const { data: credentials = [], isLoading } = useCredentials(ORG_ID);
  const { data: agents = [] } = useVoiceAgents(ORG_ID);
  const createCredential = useCreateCredential();
  const upsertAgent = useUpsertVoiceAgent(ORG_ID);
  const uploadFile = useUploadFile();
  const deleteCredential = useDeleteCredential(ORG_ID);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [vendorToDelete, setVendorToDelete] = useState<IntegrationCredential | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newVendor, setNewVendor] = useState({
    name: "",
    type: "ELEVENLABS",
    apiKey: "",
    apiSid: "",
    subdomain: "",
    logoUrl: ""
  });

  const [newAgent, setNewAgent] = useState({
    name: "",
    agentId: "",
  });

  const filteredVendors = credentials
    .filter(c => VOICE_CRED_TYPES.includes(c.type))
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile.mutate(file, {
      onSuccess: (data) => {
        setNewVendor({ ...newVendor, logoUrl: data.url });
      }
    });
  };

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
      metadata: { logoUrl: newVendor.logoUrl },
      isActive: true,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setNewVendor({ name: "", type: "ELEVENLABS", apiKey: "", apiSid: "", subdomain: "", logoUrl: "" });
      }
    });
  };

  const handleAddAgent = () => {
    if (!selectedVendor) return;

    upsertAgent.mutate({
      tenantId: ORG_ID,
      credentialId: selectedVendor.id,
      providerName: newAgent.name,
      config: { agentId: newAgent.agentId },
      isActive: true,
    }, {
      onSuccess: () => {
        setIsAddAgentOpen(false);
        setNewAgent({ name: "", agentId: "" });
        setSelectedVendor(null);
      }
    });
  };

  const openAddAgent = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsAddAgentOpen(true);
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

      {/* ── Search Bar ────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search vendors or providers..."
          className="pl-10 h-10 rounded-xl border-border/60 bg-muted/20 focus-visible:ring-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading credentials...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <EmptyState onAdd={() => setIsAddOpen(true)} hasSearch={!!searchTerm} onClear={() => setSearchTerm("")} />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50 border-none">
                <TableHead className="w-[30%]">Vendor Name</TableHead>
                <TableHead className="w-[20%]">Provider</TableHead>
                <TableHead className="w-[15%]">Agents</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => {
                const meta = PROVIDER_META[vendor.type.toLowerCase() as VoiceProviderType] || { label: vendor.type, color: "#94a3b8" };
                const agentCount = agents.filter(a => a.credentialId === vendor.id).length;

                return (
                  <TableRow key={vendor.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="size-10 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden border border-border/20"
                          style={{ backgroundColor: meta.color }}
                        >
                          {vendor.metadata?.logoUrl ? (
                            <img 
                              src={vendor.metadata.logoUrl as string} 
                              alt={vendor.name} 
                              className="size-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <ShieldCheck className="size-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{vendor.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Added {format(new Date(vendor.createdAt), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted/50 text-xs font-medium px-2 py-0.5 rounded-md">
                        {meta.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {agentCount}
                        </div>
                        <span className="text-xs text-muted-foreground">Agents</span>
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => openAddAgent(vendor)}
                          title="Add Agent"
                        >
                          <Plus className="size-4 text-primary" />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl w-48">
                            <DropdownMenuItem className="gap-2" onClick={() => openAddAgent(vendor)}>
                              <Plus className="size-4" />
                              Add Agent
                            </DropdownMenuItem>
                            <Link to="/voice-tech/agents" search={{ credentialId: vendor.id } as any}>
                              <DropdownMenuItem className="gap-2">
                                <ExternalLink className="size-4" />
                                View Agents
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2">
                              <ShieldCheck className="size-4" />
                              Test Connection
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive gap-2"
                              onClick={() => setVendorToDelete(vendor)}
                            >
                              <Trash2 className="size-4" />
                              Delete Vendor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Provider Type</Label>
                <Select
                  value={newVendor.type}
                  onValueChange={(v) => setNewVendor({ ...newVendor, type: v })}
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

              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo URL / Upload</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input 
                      id="logoUrl" 
                      placeholder="Enter logo URL or upload ..." 
                      value={newVendor.logoUrl}
                      onChange={(e) => setNewVendor({...newVendor, logoUrl: e.target.value})}
                      className="rounded-xl h-11"
                    />
                    {newVendor.logoUrl && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-lg overflow-hidden border bg-muted shadow-sm">
                        <img src={newVendor.logoUrl} className="size-full object-cover" />
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-xl h-11 w-11 shrink-0 relative bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                    disabled={uploadFile.isPending}
                    type="button"
                  >
                    {uploadFile.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*"
                      onChange={handleUploadLogo}
                    />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground ml-1">Optional: Provide a direct image link or click the icon to upload.</p>
              </div>

              {newVendor.type === "EXOTEL" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="apiSid">Account SID</Label>
                    <Input
                      id="apiSid"
                      placeholder="Exotel Account SID"
                      value={newVendor.apiSid}
                      onChange={(e) => setNewVendor({ ...newVendor, apiSid: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subdomain">Subdomain</Label>
                    <Input
                      id="subdomain"
                      placeholder="api.exotel.com"
                      value={newVendor.subdomain}
                      onChange={(e) => setNewVendor({ ...newVendor, subdomain: e.target.value })}
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

      {/* ── Add Agent Dialog ───────────────────────────────── */}
      <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="size-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Bot className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-bold">Add Voice Agent</DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-1">
              Link a specific agent ID from {selectedVendor?.name} to your dashboard.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="agent-name">Agent Label</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Customer Support Bot"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="rounded-xl h-11"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="agent-id">Provider Agent ID</Label>
                <Input
                  id="agent-id"
                  placeholder="Paste the ID from your provider dashboard"
                  value={newAgent.agentId}
                  onChange={(e) => setNewAgent({ ...newAgent, agentId: e.target.value })}
                  className="rounded-xl h-11 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t gap-2">
            <Button variant="ghost" onClick={() => setIsAddAgentOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleAddAgent}
              disabled={!newAgent.name || !newAgent.agentId || upsertAgent.isPending}
              className="rounded-xl px-8"
            >
              {upsertAgent.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Bot className="size-4 mr-2" />}
              Create Agent
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────── */}
      <AlertDialog open={!!vendorToDelete} onOpenChange={(open) => !open && setVendorToDelete(null)}>
        <AlertDialogContent className="rounded-2xl border-border/60">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Vendor?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Do you want to delete <span className="font-bold text-foreground">{vendorToDelete?.name}</span>? 
              This action cannot be undone and will disconnect all associated agents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-border/60 h-11 px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="rounded-xl h-11 px-6 bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
              onClick={() => {
                if (vendorToDelete) {
                  deleteCredential.mutate(vendorToDelete.id);
                  setVendorToDelete(null);
                }
              }}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({ onAdd, hasSearch, onClear }: { onAdd: () => void; hasSearch?: boolean; onClear?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5 border-border/60 text-center px-4">
      <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/20">
        <ShieldCheck className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        {hasSearch ? "No matching vendors" : "Secure Your Voice Stack"}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        {hasSearch
          ? "We couldn't find any vendors matching your search. Try adjusting your query."
          : "You haven't added any voice provider credentials yet. Connect ElevenLabs, Sarvam, or Vapi to start orchestrating."}
      </p>
      {hasSearch ? (
        <Button onClick={onClear} variant="outline" className="rounded-2xl px-8 h-12">
          Clear Search
        </Button>
      ) : (
        <Button onClick={onAdd} className="gap-2 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 text-base">
          <Plus className="size-5" />
          Add First Vendor
        </Button>
      )}
    </div>
  );
}

