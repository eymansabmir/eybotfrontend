import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  ShieldCheck,
  MoreVertical,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
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
import { Input } from "@/components/ui/input";
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
  useVoiceAgents, 
  useDeleteCredential,
} from "../../api/voice-tech-queries";
import { PROVIDER_META, type VoiceProvider as VoiceProviderType, type IntegrationCredential } from "../../types";
import { format } from "date-fns";

const ORG_ID = "tenant-ey-001";
const VOICE_CRED_TYPES = ["ELEVENLABS", "SARVAM", "VAPI", "EXOTEL"];

export function VendorsPage() {
  const { data: credentials = [], isLoading } = useCredentials(ORG_ID);
  const { data: agents = [] } = useVoiceAgents(ORG_ID);
  const deleteCredential = useDeleteCredential(ORG_ID);

  const [vendorToDelete, setVendorToDelete] = useState<IntegrationCredential | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendors = credentials
    .filter(c => VOICE_CRED_TYPES.includes(c.type))
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-background -mx-8 -mt-8 px-8 pt-8 min-h-screen">
      <div className="space-y-8 pb-10 max-w-[1400px] mx-auto">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech">
            <Button variant="ghost" size="icon" className="rounded-full bg-card border border-border shadow-sm hover:bg-muted">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Voice Vendors
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Securely manage API credentials and agent configurations for your voice intelligence stack.
            </p>
          </div>
        </div>
        <Link to="/voice-tech/vendors/create" search={{ returnTo: "/voice-tech/vendors" } as any}>
          <Button className="gap-2 h-10 px-6 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide">
            <Plus className="size-3.5" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* ── Table & Controls Unified Container ──────────────── */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search vendors or providers..." 
              className="pl-10 h-11 bg-background border-border rounded-md text-sm focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {filteredVendors.length} Providers Connected
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="size-10 text-muted animate-spin" />
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Synchronizing credentials...</p>
          </div>
        ) : filteredVendors.length === 0 ? (
          <EmptyState hasSearch={!!searchTerm} onClear={() => setSearchTerm("")} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 w-[35%]">Vendor Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 w-[20%]">Provider</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 w-[15%]">Agents</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 w-[15%]">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => {
                  const meta = PROVIDER_META[vendor.type.toLowerCase() as VoiceProviderType] || { label: vendor.type, color: "#94a3b8" };
                  const agentCount = agents.filter(a => a.credentialId === vendor.id).length;

                  return (
                    <TableRow key={vendor.id} className="group hover:bg-muted/50 border-b border-border last:border-0 transition-colors">
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div 
                            className="size-11 rounded-xl flex items-center justify-center text-white shadow-sm overflow-hidden border border-border"
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
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{vendor.name}</p>
                            <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-tight mt-0.5">Added {format(new Date(vendor.createdAt), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge variant="outline" className="bg-muted text-foreground border-border text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-foreground border border-border">
                            {agentCount}
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Agents</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        {vendor.isActive ? (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="size-3 mr-1.5" />
                            Active
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle className="size-3 mr-1.5" />
                            Inactive
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-9 rounded-lg hover:bg-muted text-muted-foreground">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="rounded-xl w-52 p-1.5 shadow-xl border-border bg-popover">
                              <Link to="/voice-tech/agents/create" search={{ credentialId: vendor.id, returnTo: "/voice-tech/vendors" } as any}>
                                <DropdownMenuItem className="gap-3 h-10 rounded-lg text-xs font-bold uppercase tracking-wide">
                                  <Plus className="size-4 text-slate-400" />
                                  Add Agent
                                </DropdownMenuItem>
                              </Link>
                              <Link to="/voice-tech/vendors/agents" search={{ credentialId: vendor.id } as any}>
                                <DropdownMenuItem 
                                  className="gap-3 h-10 rounded-lg text-xs font-bold uppercase tracking-wide"
                                >
                                  <ExternalLink className="size-4 text-slate-400" />
                                  View Agents
                                </DropdownMenuItem>
                              </Link>
                               <DropdownMenuSeparator className="my-1.5 bg-border" />
                              <DropdownMenuItem className="gap-3 h-10 rounded-lg text-xs font-bold uppercase tracking-wide">
                                <ShieldCheck className="size-4 text-slate-400" />
                                Test Connection
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-rose-600 focus:text-rose-600 focus:bg-rose-500/10 gap-3 h-10 rounded-lg text-xs font-bold uppercase tracking-wide"
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
      </div>

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
    </div>
  );
}

function EmptyState({ hasSearch, onClear }: { hasSearch?: boolean; onClear?: () => void }) {
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
        <Link to="/voice-tech/vendors/create">
          <Button 
            className="gap-2 h-12 px-8 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-2xl text-xs font-bold uppercase tracking-wide"
          >
            <Plus className="size-5" />
            Add First Vendor
          </Button>
        </Link>
      )}
    </div>
  );
}
