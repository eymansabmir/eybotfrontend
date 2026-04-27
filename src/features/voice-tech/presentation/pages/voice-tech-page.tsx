import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  Activity,
  ArrowUpRight,
  GitBranch,
  Database,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEntityTypes, useRoutingConfigs } from "../../api/voice-tech-queries";
import { OrchestrationTable } from "../components/orchestration-table";

const TENANT_ID = "tenant-ey-001";

export function VoiceTechPage() {
  const navigate = useNavigate();
  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);
  const { data: entityTypes = [] } = useEntityTypes(TENANT_ID);

  return (
    <div className="space-y-8 pb-10">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-1">
            <Activity className="size-3.5 animate-pulse" />
            Voice Intelligence
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Voice Orchestrations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and manage your voice call routing plans and vendor performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => navigate({ to: "/voice-tech/create" })} 
            className="gap-2 h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl"
          >
            <Plus className="size-4" />
            Create Orchestration
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Orchestrations" 
          value={configs.length} 
          trend="+2 this month" 
          icon={GitBranch}
          color="blue"
        />
        <StatsCard 
          title="Active Datasets" 
          value={entityTypes.length} 
          trend="Across 4 regions" 
          icon={Database}
          color="violet"
        />
        <StatsCard 
          title="Global Rules" 
          value={configs.reduce((acc, _) => acc + 0, 0)} // Needs backend support for count in summary
          trend="84% Success Rate" 
          icon={Activity}
          color="emerald"
        />
        <StatsCard 
          title="Vendors Linked" 
          value="3" 
          trend="ElevenLabs, Sarvam..." 
          icon={Users}
          color="orange"
        />
      </div>

      {/* ── Table Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search orchestrations..." 
            className="pl-10 h-11 bg-card border-border/60 focus:ring-primary/20 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 h-11 rounded-xl border-border/60 bg-card hover:bg-muted/50">
            <Filter className="size-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2 h-11 rounded-xl border-border/60 bg-card hover:bg-muted/50">
            Download CSV
          </Button>
        </div>
      </div>

      {/* ── Orchestration Table ───────────────────────────── */}
      <OrchestrationTable 
        configs={configs} 
        entityTypes={entityTypes} 
        isLoading={configsLoading} 
      />
    </div>
  );
}

function StatsCard({ title, value, trend, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-500/10 text-blue-600",
    violet: "bg-violet-500/10 text-violet-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    orange: "bg-orange-500/10 text-orange-600",
  };

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.blue}`}>
            <Icon className="size-5" />
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-full">
            <ArrowUpRight className="size-3" />
            {trend}
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}

