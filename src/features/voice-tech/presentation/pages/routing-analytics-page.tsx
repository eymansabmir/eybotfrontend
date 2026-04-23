import { useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { 
  ArrowLeft, 
  Database, 
  TrendingUp,
  Search,
  Settings,
  Layers,
  Filter,
  CheckCircle2,
  LayoutGrid,
  ChevronRight,
  Zap,
  Activity,
  Globe,
  PieChart,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRoutingConfig, useOrchestrationStats } from "../../api/voice-tech-queries";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const TENANT_ID = "tenant-ey-001";

export function RoutingAnalyticsPage() {
  const { id } = useParams({ strict: false });
  const { data: config, isLoading: configLoading } = useRoutingConfig(id ?? null, TENANT_ID);
  const { data: stats, isLoading: statsLoading } = useOrchestrationStats(TENANT_ID, id ?? null);

  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [activePriority, setActivePriority] = useState<string>("ALL");

  if (configLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] p-8 space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-64 rounded-lg" />
           <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-12 gap-8 h-[600px]">
          <Skeleton className="col-span-3 rounded-2xl" />
          <Skeleton className="col-span-9 rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!config || !stats) {
    return <div className="p-12 text-center text-slate-400 font-medium">No orchestration data available for this configuration.</div>;
  }

  const totalMatched = stats.ruleStats.reduce((acc, r) => acc + r.count, 0);
  const matchRate = stats.totalRecords > 0 ? (totalMatched / stats.totalRecords) * 100 : 0;
  const uniqueVendors = new Set(stats.ruleStats.map(r => r.provider)).size;

  const filteredRules = stats.ruleStats.filter(r => {
    const matchesFilter = r.provider.toLowerCase().includes(filterText.toLowerCase()) || 
                         r.conditionsSummary.toLowerCase().includes(filterText.toLowerCase());
    if (activePriority === "ALL") return matchesFilter;
    const priority = stats.ruleStats.indexOf(r) % 3 === 0 ? "HIGH" : stats.ruleStats.indexOf(r) % 3 === 1 ? "MEDIUM" : "LOW";
    return matchesFilter && priority === activePriority;
  });

  const activeRulesForFlow = selectedRuleId 
    ? stats.ruleStats.filter(r => r.ruleId === selectedRuleId)
    : stats.ruleStats;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100/50">
      
      {/* ── Header Navigation ────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <Link to="/voice-tech/routings" className="group">
             <div className="size-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white shadow-sm group-hover:bg-slate-50 transition-colors">
               <ArrowLeft className="size-4 text-slate-500 group-hover:text-slate-900 transition-colors" />
             </div>
           </Link>
           <div className="h-6 w-px bg-slate-200" />
           <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Activity className="size-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-900">Analytics Engine</h1>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{config.name}</p>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
             <Input 
               placeholder="Search orchestration flow..." 
               className="pl-9 h-9 w-64 bg-slate-100/50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-200 text-xs rounded-lg transition-all"
               value={filterText}
               onChange={(e) => setFilterText(e.target.value)}
             />
           </div>
           <Button variant="ghost" size="icon" className="size-9 rounded-lg text-slate-400 hover:text-slate-900">
             <Settings className="size-5" />
           </Button>
        </div>
      </nav>

      <main className="p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* ── Top Level KPIs ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { label: 'Total Records', val: stats.totalRecords.toLocaleString(), icon: Database, color: 'blue', desc: 'Ingested records' },
            { label: 'Data Sets', val: stats.datasets.join(", ") || 'None', icon: Layers, color: 'violet', desc: 'Active sources' },
            { label: 'Rules Applied', val: stats.rulesCount.toString(), icon: Filter, color: 'amber', desc: 'Active logic' },
            { label: 'Match Rate', val: `${matchRate.toFixed(1)}%`, icon: TrendingUp, color: 'emerald', desc: 'Efficiency' },
            { label: 'Vendor Outlets', val: `${uniqueVendors} Vendors`, icon: Globe, color: 'indigo', desc: 'Diverted paths' }
          ].map((kpi, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={i} 
              className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                 <div className={cn("size-10 rounded-xl flex items-center justify-center transition-colors", {
                    "bg-blue-50 text-blue-600": kpi.color === 'blue',
                    "bg-violet-50 text-violet-600": kpi.color === 'violet',
                    "bg-amber-50 text-amber-600": kpi.color === 'amber',
                    "bg-emerald-50 text-emerald-600": kpi.color === 'emerald',
                    "bg-indigo-50 text-indigo-600": kpi.color === 'indigo',
                 })}>
                    <kpi.icon className="size-5" />
                 </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">{kpi.val}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">{kpi.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Main Workspace ──────────────────────────────── */}
        <div className="grid grid-cols-12 gap-8 h-[700px]">
          
          {/* Sidebar: Rule Logic Browser */}
          <aside className="col-span-12 lg:col-span-3 flex flex-col bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
             <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     <Filter className="size-3 text-blue-600" />
                     Rule Browser
                   </span>
                   <Badge variant="secondary" className="h-4 text-[8px] bg-slate-100 text-slate-500 border-none font-bold">
                     {stats.ruleStats.length}
                   </Badge>
                </div>
                <div className="flex p-0.5 bg-slate-100 rounded-lg">
                   {['ALL', 'HIGH', 'MEDIUM'].map((p) => (
                      <button 
                        key={p}
                        onClick={() => setActivePriority(p)}
                        className={cn(
                          "flex-1 py-1 text-[9px] font-bold rounded-md transition-all",
                          activePriority === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                        )}
                      >
                        {p}
                      </button>
                   ))}
                </div>
             </div>

             <div className="flex-1 overflow-y-auto vt-scrollbar p-2 space-y-1.5">
                {filteredRules.map((rule, idx) => {
                  const priority = idx % 3 === 0 ? "HIGH" : idx % 3 === 1 ? "MEDIUM" : "LOW";
                  const isActive = selectedRuleId === rule.ruleId;
                  
                  return (
                    <motion.div 
                      key={rule.ruleId}
                      onClick={() => setSelectedRuleId(isActive ? null : rule.ruleId)}
                      className={cn(
                        "p-3 rounded-xl border transition-all cursor-pointer group relative",
                        isActive 
                          ? "bg-blue-50 border-blue-200 shadow-sm" 
                          : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                         <div className="flex items-center gap-1.5">
                            <div className={cn("size-1.5 rounded-full", {
                               "bg-rose-500": priority === 'HIGH',
                               "bg-amber-500": priority === 'MEDIUM',
                               "bg-slate-400": priority === 'LOW',
                            })} />
                            <span className="text-[9px] font-black text-slate-400 uppercase">{priority}</span>
                         </div>
                         <span className="text-[9px] font-bold text-slate-900 bg-white px-1 py-0.5 rounded border border-slate-100">
                           {rule.count.toLocaleString()}
                         </span>
                      </div>
                      <h4 className={cn("text-[11px] font-bold mb-0.5", isActive ? "text-blue-700" : "text-slate-700")}>
                        {rule.provider}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-medium truncate italic">
                        {rule.conditionsSummary.toLowerCase()}
                      </p>
                    </motion.div>
                  );
                })}
             </div>
          </aside>

          {/* Canvas: Flowchart */}
          <div className="col-span-12 lg:col-span-9 bg-white border border-slate-200/60 rounded-[2.5rem] shadow-sm relative overflow-hidden flex items-center justify-center p-12 group/canvas">
             <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
             
             {/* Flow Graphics */}
             <svg className="absolute inset-0 size-full pointer-events-none">
                <AnimatePresence>
                  {activeRulesForFlow.map((rule, idx) => {
                    const startX = 350;
                    const startY = 350;
                    const endX = 720;
                    const spacing = 140;
                    const totalRules = activeRulesForFlow.length;
                    const endY = 350 + (idx - (totalRules - 1) / 2) * spacing;
                    
                    const isFocus = selectedRuleId === rule.ruleId;
                    
                    return (
                      <g key={rule.ruleId}>
                        <motion.path 
                          d={`M ${startX} ${startY} L ${startX + 60} ${startY} C ${startX + 150} ${startY}, ${endX - 150} ${endY}, ${endX} ${endY}`}
                          stroke={isFocus ? "#2563EB" : "#E2E8F0"}
                          strokeWidth={isFocus ? "2.5" : "1"}
                          fill="none"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: isFocus ? 1 : 0.6 }}
                          exit={{ opacity: 0 }}
                        />
                        <motion.circle
                          r={isFocus ? "3.5" : "2"}
                          fill={isFocus ? "#2563EB" : "#CBD5E1"}
                          animate={{ offsetDistance: ["0%", "100%"] }}
                          transition={{ duration: isFocus ? 2.5 : 5, repeat: Infinity, ease: "linear" }}
                          style={{ offsetPath: `path("M ${startX} ${startY} L ${startX + 60} ${startY} C ${startX + 150} ${startY}, ${endX - 150} ${endY}, ${endX} ${endY}")` }}
                        />
                        <foreignObject x={(startX + endX) / 2 - 40} y={(startY + endY) / 2 - 10} width="80" height="20">
                           <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-md text-[7px] font-black uppercase text-slate-500 flex items-center justify-center h-full shadow-sm px-1.5">
                              {rule.conditionsSummary || 'General'}
                           </div>
                        </foreignObject>
                      </g>
                    );
                  })}
                </AnimatePresence>
             </svg>

             {/* 1. Hub */}
             <div className="absolute left-[120px] top-1/2 -translate-y-1/2 z-20 text-center">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-blue-600 px-6 py-5 rounded-2xl shadow-xl border-4 border-white flex flex-col items-center gap-3 w-[180px] relative overflow-hidden"
                >
                  <div className="size-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
                     <LayoutGrid className="size-5" />
                  </div>
                  <div>
                     <h2 className="text-sm font-black text-white tracking-tight">Main Router</h2>
                     <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-0.5">
                       Root Source
                     </p>
                  </div>
                </motion.div>
             </div>

             {/* 2. Endpoints */}
             <div className="absolute right-[100px] top-1/2 -translate-y-1/2 flex flex-col gap-10 z-20 h-full justify-center">
                {activeRulesForFlow.map((rule) => {
                  const isFocus = selectedRuleId === rule.ruleId;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={rule.ruleId} 
                      className={cn(
                        "bg-white border rounded-xl shadow-lg flex items-center gap-4 px-5 py-3 min-w-[190px] transition-all",
                        isFocus ? "border-blue-500 ring-4 ring-blue-100 scale-105" : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="size-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-md font-black text-[10px] uppercase tracking-tighter">
                        {rule.provider.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{rule.provider}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                           <Activity className="size-2 text-blue-500" />
                           <span className="text-[9px] text-slate-400 font-bold uppercase">{rule.count.toLocaleString()} calls</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
             </div>

          </div>
        </div>
      </main>
    </div>
  );
}
