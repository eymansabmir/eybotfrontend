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
import { Link, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useVoiceAgents, useDeleteVoiceAgent } from "../../api/voice-tech-queries";
import { format } from "date-fns";

const ORG_ID = "tenant-ey-001";

export function AgentsPage() {
  const search = useSearch({ from: "/voice-tech/agents" }) as any;
  const credentialId = search.credentialId;

  const { data: agents = [], isLoading } = useVoiceAgents(ORG_ID, credentialId);
  const deleteMutation = useDeleteVoiceAgent(ORG_ID);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgents = agents.filter(a =>
    a.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.credential?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto px-4 sm:px-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/voice-tech/vendors">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
              <Bot className="size-3.5" />
              Agent Management
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Voice Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure and manage specific AI agents across your voice vendors.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search & Filters ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search agents or vendors..."
            className="pl-10 h-11 rounded-xl bg-muted/30 border-none focus-visible:ring-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button className="gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 flex-1 sm:flex-none">
            <Plus className="size-4" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="size-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Loading agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <EmptyState hasSearch={!!searchTerm} onClear={() => setSearchTerm("")} />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[30%]">Agent Name</TableHead>
                <TableHead className="w-[25%]">Vendor</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[15%]">Created</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Bot className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{agent.providerName}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: {agent.config.agentId || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-muted/50 text-xs font-medium px-2 py-0.5 rounded-md">
                        {agent.credential?.name || "Unknown"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                        {agent.credential?.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.isActive ? (
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
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(agent.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl w-48">
                        <DropdownMenuItem className="gap-2">
                          <Edit2 className="size-4" />
                          Edit Agent
                        </DropdownMenuItem>
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
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasSearch, onClear }: { hasSearch: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-3xl bg-muted/5 border-border/60 text-center px-4">
      <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/20">
        <Bot className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        {hasSearch ? "No matching agents" : "No Agents Configured"}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-8">
        {hasSearch
          ? "We couldn't find any agents matching your search terms. Try something else."
          : "Start by adding specific AI agents under your voice vendors to use them in orchestrations."}
      </p>
      {hasSearch ? (
        <Button onClick={onClear} variant="outline" className="rounded-2xl px-8 h-12">
          Clear Search
        </Button>
      ) : (
        <Button className="gap-2 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 text-base">
          <Plus className="size-5" />
          Add First Agent
        </Button>
      )}
    </div>
  );
}
