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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const TENANT_ID = "tenant-ey-001";

export function VoiceTechPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; order: "asc" | "desc" }>({
    key: "name",
    order: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);
  const { data: entityTypes = [] } = useEntityTypes(TENANT_ID);



  const filteredConfigs = useMemo(() => {
    let result = configs.filter(config => {
      const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDataset = selectedDatasetIds.length === 0 || 
                            (config.entityTypeId && selectedDatasetIds.includes(config.entityTypeId)) ||
                            config.entityTypeIds?.some(id => selectedDatasetIds.includes(id));
      
      return matchesSearch && matchesDataset;
    });

    result.sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.order === "asc" 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      }
      if (sortConfig.key === "date") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortConfig.order === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [configs, searchQuery, selectedDatasetIds, sortConfig]);

  const paginatedConfigs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredConfigs.slice(start, start + pageSize);
  }, [filteredConfigs, currentPage, pageSize]);

  return (
    <div className="bg-background -mx-8 -mt-8 px-8 pt-8 min-h-screen">
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
          <div className="flex items-center gap-2 bg-card border px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium text-muted-foreground">
            <Activity className="size-3.5 text-primary" />
            <span>Oct 1 - Oct 31, 2023</span>
          </div>
          <Button 
            onClick={() => navigate({ to: "/voice-tech/create" })} 
            className="gap-2 h-10 px-6 bg-primary text-primary-foreground hover:opacity-90 shadow-sm rounded-lg text-xs font-bold uppercase tracking-wide"
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
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search orchestrations, models, or agents..." 
              className="pl-10 h-11 bg-background border-border rounded-md text-sm focus-visible:ring-1 focus-visible:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 rounded-md border-border bg-background text-sm font-semibold px-5 text-foreground hover:bg-muted">
                  <Filter className="size-4" />
                  Filters
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 shadow-xl border-border bg-popover" align="end">
                <div className="p-2 border-b border-border mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filter by Dataset</p>
                </div>
                <div className="space-y-1 max-h-[300px] overflow-y-auto pt-1">
                  {entityTypes.map(type => (
                    <div 
                      key={type.id}
                      className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedDatasetIds(prev => 
                          prev.includes(type.id) ? prev.filter(id => id !== type.id) : [...prev, type.id]
                        );
                      }}
                    >
                      <Checkbox checked={selectedDatasetIds.includes(type.id)} className="size-4 rounded-sm border-muted-foreground/30" />
                      <span className="text-xs font-medium truncate flex-1 text-foreground">{type.name}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-11 rounded-md border-border bg-background text-sm font-semibold px-5 text-foreground hover:bg-muted">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4"/></svg>
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-xl border-border bg-popover">
                <div className="p-2 border-b border-border mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort By</p>
                </div>
                <DropdownMenuItem className="text-xs font-semibold py-2.5" onClick={() => setSortConfig({ key: "name", order: "asc" })}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-semibold py-2.5" onClick={() => setSortConfig({ key: "name", order: "desc" })}>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-semibold py-2.5" onClick={() => setSortConfig({ key: "date", order: "desc" })}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-semibold py-2.5" onClick={() => setSortConfig({ key: "date", order: "asc" })}>
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-11 flex items-center gap-2 pl-4 border-l border-border ml-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Show:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 gap-2 text-xs font-bold text-foreground hover:bg-muted">
                    {pageSize} rows
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 rounded-lg shadow-xl border-border bg-popover">
                  {[10, 25, 50, 100].map(size => (
                    <DropdownMenuItem 
                      key={size} 
                      className="text-xs font-semibold py-2"
                      onClick={() => {
                        setPageSize(size);
                        setCurrentPage(1);
                      }}
                    >
                      {size} rows
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Orchestration Table */}
        <OrchestrationTable 
          configs={paginatedConfigs} 
          isLoading={configsLoading}
          currentPage={currentPage}
          pageSize={pageSize}
          totalCount={filteredConfigs.length}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
    </div>
  );
}

 function StatsCard({ title, value, trend, barColor, isTrendPositive, progress = 40 }: any) {
  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden rounded-xl border-t border-x border-b hover:shadow-md transition-all duration-300">
      <CardContent className="p-7">
        <div className="flex items-start justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <div className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded",
            isTrendPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10",
            trend === "Stable" && "text-muted-foreground bg-muted"
          )}>
            {trend}
          </div>
        </div>
        <div className="mt-5">
          <h3 className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </h3>
          <div className="mt-8 h-1 w-full bg-muted rounded-full overflow-hidden">
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

