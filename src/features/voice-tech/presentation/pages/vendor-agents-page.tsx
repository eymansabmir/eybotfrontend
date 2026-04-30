import { useState } from "react";
import {
  ArrowLeft,
  Bot,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link, useSearch, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVoiceAgents, useDeleteVoiceAgent, useCredentials } from "../../api/voice-tech-queries";
import { format } from "date-fns";

const ORG_ID = "tenant-ey-001";

export function VendorAgentsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/voice-tech/vendors/agents" }) as any;
  const credentialId = search.credentialId;

  const { data: credentials = [] } = useCredentials(ORG_ID);
  const vendor = credentials.find(c => c.id === credentialId);

  const { data: agents = [], isLoading } = useVoiceAgents(ORG_ID, credentialId);
  const deleteMutation = useDeleteVoiceAgent(ORG_ID);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = agents.filter(a =>
    a.providerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!credentialId) {
    navigate({ to: "/voice-tech/vendors" });
    return null;
  }

  return (
    <div className="bg-background -mx-8 -mt-8 px-8 pt-8 min-h-screen">
      <div className="space-y-8 pb-10 max-w-[1400px] mx-auto">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/voice-tech/vendors">
              <Button variant="ghost" size="icon" className="rounded-full bg-card border border-border shadow-sm hover:bg-muted">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                ORCHESTRATOR <span className="mx-2 text-muted-foreground/30">›</span> VENDORS <span className="mx-2 text-muted-foreground/30">›</span> {vendor?.name || "PROVIDER"} <span className="mx-2 text-muted-foreground/30">›</span> AGENTS
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {vendor?.name} Agents
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Configure and manage specific AI entities linked to your {vendor?.type} credentials.
              </p>
            </div>
          </div>
          <Link to="/voice-tech/agents/create" search={{ credentialId, returnTo: `/voice-tech/vendors/agents?credentialId=${credentialId}` } as any}>
            <Button className="gap-2 h-10 px-6 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide">
              <Plus className="size-3.5" />
              Add Agent
            </Button>
          </Link>
        </div>

        {/* ── Table Container ───────────────────────────────── */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input 
                placeholder="Search entities by name..." 
                className="pl-10 h-11 bg-background border-border rounded-md text-sm focus-visible:ring-1 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="size-10 text-muted animate-spin" />
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Loading agents...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
              <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/20">
                <Bot className="size-10" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Agents Found</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                You haven't configured any specific AI agents for this vendor yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12">Agent Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12">Provider ID</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12">Created</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-6 h-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="group hover:bg-muted/50 border-b border-border last:border-0 transition-colors">
                    <TableCell className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Bot className="size-5" />
                        </div>
                        <p className="font-bold text-sm text-foreground">{agent.providerName}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {agent.config.agentId}
                      </code>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      {agent.isActive ? (
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
                    <TableCell className="px-6 py-5 text-sm text-muted-foreground">
                      {format(new Date(agent.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl w-48">
                          <Link 
                            to="/voice-tech/agents/create" 
                            search={{ edit: agent.id, returnTo: `/voice-tech/vendors/agents?credentialId=${credentialId}` } as any}
                          >
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="size-4" />
                              Edit Agent
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive gap-2"
                            onClick={() => deleteMutation.mutate(agent.id)}
                          >
                            <Trash2 className="size-4" />
                            Delete Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
