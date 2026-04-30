import { useMemo, useState } from "react";
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
import { useEntityTypes, useRoutingConfigs, useCredentials } from "../../api/voice-tech-queries";
import { OrchestrationTable } from "../components/orchestration-table";
import { Checkbox } from "@/components/ui/checkbox";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";

const TENANT_ID = "tenant-ey-001";

export function VoiceTechPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);

  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);
  const { data: entityTypes = [] } = useEntityTypes(TENANT_ID);
  const { data: credentials = [] } = useCredentials(TENANT_ID);

  const totalRules = useMemo(() => 
    0, // Total rules not available in summary
    []
  );

  const vendorNames = useMemo(() => {
    const names = Array.from(new Set(credentials.map(c => c.name || c.type)));
    if (names.length === 0) return "No vendors linked";
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")}...`;
  }, [credentials]);

  const filteredConfigs = useMemo(() => {
    return configs.filter(config => {
      const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDataset = selectedDatasetIds.length === 0 || 
                            (config.entityTypeId && selectedDatasetIds.includes(config.entityTypeId)) ||
                            config.entityTypeIds?.some(id => selectedDatasetIds.includes(id));
      
      return matchesSearch && matchesDataset;
    });
  }, [configs, searchQuery, selectedDatasetIds]);

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
          trend={`Across ${entityTypes.length} regions`} 
          icon={Database}
          color="violet"
        />
        <StatsCard 
          title="Global Rules" 
          value={totalRules} 
          trend="84% Success Rate" 
          icon={Activity}
          color="emerald"
        />
        <StatsCard 
          title="Vendors Linked" 
          value={credentials.length} 
          trend={vendorNames} 
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 h-11 rounded-xl border-border/60 bg-card hover:bg-muted/50">
                <Filter className="size-4" />
                {selectedDatasetIds.length > 0 ? `Datasets (${selectedDatasetIds.length})` : "Filters"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="p-2 border-b mb-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter by Dataset</p>
              </div>
              <div className="space-y-1 max-h-[240px] overflow-y-auto pt-1">
                {entityTypes.map(type => (
                  <div 
                    key={type.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedDatasetIds(prev => 
                        prev.includes(type.id) ? prev.filter(id => id !== type.id) : [...prev, type.id]
                      );
                    }}
                  >
                    <Checkbox checked={selectedDatasetIds.includes(type.id)} className="size-4" />
                    <span className="text-xs font-medium truncate flex-1">{type.name}</span>
                    {selectedDatasetIds.includes(type.id) && <Check className="size-3.5 text-primary" />}
                  </div>
                ))}
                {entityTypes.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-4 italic">No datasets available</p>
                )}
              </div>
              {selectedDatasetIds.length > 0 && (
                <Button 
                  variant="ghost" 
                  className="w-full h-8 text-[10px] font-bold mt-2 text-primary hover:text-primary hover:bg-primary/5"
                  onClick={() => setSelectedDatasetIds([])}
                >
                  Clear Selection
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── Orchestration Table ───────────────────────────── */}
      <OrchestrationTable 
        configs={filteredConfigs} 
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

