import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Activity, Search, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEntityTypes, useRoutingConfigs } from "../../api/voice-tech-queries";
import { OrchestrationTable } from "../components/orchestration-table";
import { Checkbox } from "@/components/ui/checkbox";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


const TENANT_ID = "tenant-ey-001";

export function VoiceTechPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);

  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);
  const { data: entityTypes = [] } = useEntityTypes(TENANT_ID);



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
    <div className="bg-[#f9f9f9] -mx-8 -mt-8 px-8 pt-8 min-h-screen">
      <div className="space-y-8 pb-10 max-w-[1400px] mx-auto">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orchestration Dashboard
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Manage and monitor high-stakes voice intelligence workflows across the enterprise.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-muted-foreground">
            <Activity className="size-3.5 text-primary" />
            <span>Oct 1 - Oct 31, 2023</span>
          </div>
          <Button 
            onClick={() => navigate({ to: "/voice-tech/create" })} 
            className="gap-2 h-10 px-6 bg-black text-white hover:bg-black/90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide"
          >
            <Plus className="size-3.5" />
            Create Orchestration
          </Button>
        </div>
      </div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Active Flows" 
          value={configs.length} 
          trend="+12.5%" 
          barColor="bg-black"
          isTrendPositive={true}
        />
        <StatsCard 
          title="Avg Sentiment" 
          value="0.84" 
          trend="+4.2%" 
          barColor="bg-yellow-400"
          isTrendPositive={true}
          progress={84}
        />
        <StatsCard 
          title="Processing Latency" 
          value="1.2s" 
          trend="-0.8%" 
          barColor="bg-black"
          isTrendPositive={false}
          progress={30}
        />
        <StatsCard 
          title="Confidence Score" 
          value="96.4%" 
          trend="Stable" 
          barColor="bg-yellow-400"
          isTrendPositive={true}
          progress={96}
        />
      </div>

      {/* ── Table & Controls Unified Container ──────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search orchestrations, models, or agents..." 
              className="pl-10 h-11 bg-white border-slate-200 rounded-md text-sm focus-visible:ring-1 focus-visible:ring-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 rounded-md border-slate-200 bg-white text-sm font-semibold px-5 text-slate-700 hover:bg-slate-50">
                  <Filter className="size-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 shadow-xl border-slate-200" align="end">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter by Dataset</p>
                </div>
                <div className="space-y-1 max-h-[300px] overflow-y-auto pt-1">
                  {entityTypes.map(type => (
                    <div 
                      key={type.id}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedDatasetIds(prev => 
                          prev.includes(type.id) ? prev.filter(id => id !== type.id) : [...prev, type.id]
                        );
                      }}
                    >
                      <Checkbox checked={selectedDatasetIds.includes(type.id)} className="size-4 rounded-sm" />
                      <span className="text-xs font-medium truncate flex-1 text-slate-600">{type.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" className="gap-2 h-11 rounded-md border-slate-200 bg-white text-sm font-semibold px-5 text-slate-700 hover:bg-slate-50">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
              Sort
            </Button>

            <div className="h-11 flex items-center gap-2 pl-4 border-l border-slate-100 ml-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Show:</span>
              <Button variant="ghost" className="h-9 gap-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                25 rows
                <ChevronDown className="size-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>

        {/* Orchestration Table */}
        <OrchestrationTable 
          configs={filteredConfigs} 
          isLoading={configsLoading} 
        />
      </div>
    </div>
    </div>
  );
}

function StatsCard({ title, value, trend, barColor, isTrendPositive, progress = 40 }: any) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-xl border-t border-x border-b hover:shadow-md transition-all duration-300">
      <CardContent className="p-7">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500/80">{title}</p>
          <div className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            isTrendPositive ? "text-emerald-500 bg-emerald-50" : "text-rose-500 bg-rose-50",
            trend === "Stable" && "text-slate-500 bg-slate-50"
          )}>
            {trend}
          </div>
        </div>
        <div className="mt-5">
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </h3>
          <div className="mt-8 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-1000", barColor)} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from "@/lib/utils";

