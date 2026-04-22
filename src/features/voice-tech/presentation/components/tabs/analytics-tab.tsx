import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  Database, 
  AlertCircle,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOrchestrationStats } from "../../../api/voice-tech-queries";
import { cn } from "@/lib/utils";

interface AnalyticsTabProps {
  tenantId: string;
}

export function AnalyticsTab({ tenantId }: AnalyticsTabProps) {
  const { data: stats, isLoading } = useOrchestrationStats(tenantId);
  const statusDistribution = stats?.statusDistribution || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
           <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
           <p className="text-sm font-medium text-muted-foreground">Loading real-time analytics...</p>
        </div>
      </div>
    );
  }

  const funnelData = stats?.funnel || [
    { step: 'API RECEIVED', count: 0 },
    { step: 'SERVICE PROCESSING', count: 0 },
    { step: 'ROUTING LOADED', count: 0 },
    { step: 'RULE EVALUATED', count: 0 },
    { step: 'PROVIDER INVOCATION', count: 0 },
    { step: 'RESULT SUCCESS', count: 0 },
  ];

  const maxFunnelCount = Math.max(...funnelData.map((d: any) => d.count), 1);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
               Analytics Dashboard
            </h2>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">
               Tenant: <span className="font-mono text-foreground font-bold">{tenantId}</span>
            </p>
         </div>

         <div className="flex items-center gap-2">
            <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-50" />
               <Input 
                  placeholder="Search trace IDs..." 
                  className="h-9 w-64 pl-9 bg-muted/30 border-none text-xs font-medium focus-visible:ring-1"
               />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 bg-muted/30 border-none">
               <Filter className="size-4" />
            </Button>
            <div className="size-9 rounded-full bg-slate-900 grid place-items-center text-[10px] font-black text-white">
               EY
            </div>
         </div>
      </div>

      {/* ── Top Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard 
            title="Total Requests" 
            value={stats?.totalRequests || 0} 
            subtitle="last 24h" 
            icon={<Activity className="size-4" />}
            trend="+12%"
            trendUp={true}
         />
         <StatCard 
            title="Success Rate" 
            value={`${stats?.successRate || 0}%`} 
            subtitle="operational" 
            icon={<CheckCircle2 className="size-4" />}
            trend="-2%"
            trendUp={false}
         />
         <StatCard 
            title="Avg Latency" 
            value={`${stats?.avgLatency || 0}ms`} 
            subtitle="P95 response" 
            icon={<Clock className="size-4" />}
            trend="-5%"
            trendUp={false}
         />
         <StatCard 
            title="Entities Matched" 
            value={stats?.entitiesMatched || 0} 
            subtitle="voice-orch flow" 
            icon={<Database className="size-4" />}
            trend="+8%"
            trendUp={true}
         />
      </div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 border-none bg-muted/10 shadow-none rounded-3xl p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
               <CardTitle className="text-sm font-black uppercase tracking-wider opacity-70">Response Time Trend</CardTitle>
               <select className="bg-transparent text-[10px] font-bold border-none focus:ring-0 cursor-pointer">
                  <option>Last hour</option>
                  <option>Last 24 hours</option>
               </select>
            </CardHeader>
            <CardContent className="h-[280px] w-full pt-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.trend || []}>
                     <defs>
                        <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                     <XAxis 
                        dataKey="time" 
                        fontSize={10} 
                        fontWeight={700}
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                     />
                     <YAxis 
                        fontSize={10} 
                        fontWeight={700}
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={(v) => `${v}ms`}
                     />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '12px' }}
                     />
                     <Area 
                        type="monotone" 
                        dataKey="latency" 
                        stroke="#F59E0B" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorLatency)"
                        animationDuration={1500}
                     />
                  </AreaChart>
               </ResponsiveContainer>
            </CardContent>
         </Card>

         <Card className="border-none bg-muted/10 shadow-none rounded-3xl p-2">
            <CardHeader>
               <CardTitle className="text-sm font-black uppercase tracking-wider opacity-70">HTTP Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-[320px] pt-0">
               <div className="relative size-48">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={statusDistribution.length > 0 ? statusDistribution : [{ status: 'No Data', count: 1, color: '#F1F5F9' }]}
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="count"
                        >
                           {(statusDistribution.length > 0 ? statusDistribution : [{ status: 'No Data', count: 1, color: '#F1F5F9' }]).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '12px' }}
                        />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-3xl font-black">{statusDistribution.reduce((acc: number, curr: any) => acc + curr.count, 0)}</span>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Requests</span>
                  </div>
               </div>

               <div className="w-full mt-6 space-y-2 px-4">
                  {(statusDistribution.length > 0 ? statusDistribution : [
                    { status: '200 OK', count: 0, color: '#10B981' },
                    { status: '201 Created', count: 0, color: '#3B82F6' },
                    { status: '304 Not Modified', count: 0, color: '#F59E0B' },
                    { status: '401 Unauthorized', count: 0, color: '#EF4444' }
                  ]).map((item: any, i: number) => (
                     <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                           <span className="text-[11px] font-bold text-muted-foreground">{item.status}</span>
                        </div>
                        <span className="text-[11px] font-black">{item.count}</span>
                     </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>

      {/* ── Funnel & Provider Analysis ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card className="border-none bg-muted/10 shadow-none rounded-3xl p-2">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
               <Database className="size-4 text-amber-500" />
               <CardTitle className="text-sm font-black uppercase tracking-wider opacity-70">Voice Orchestration Funnel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               {funnelData.map((item: any, i: number) => (
                  <div key={i} className="space-y-1">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase">{item.step}</span>
                        <span className="text-[10px] font-bold">{item.count} TRACES</span>
                     </div>
                     <div className="h-4 w-full bg-muted/20 rounded-full overflow-hidden relative border border-border/50">
                        <div 
                           className="h-full bg-slate-900 transition-all duration-1000 ease-out rounded-full"
                           style={{ width: `${(item.count / maxFunnelCount) * 100}%` }}
                        />
                     </div>
                  </div>
               ))}
               
               {/* Drop-off Insight */}
               <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <div className="flex gap-3">
                     <AlertCircle className="size-4 text-amber-500 mt-0.5" />
                     <div>
                        <p className="text-xs font-bold text-amber-900">Drop-off detected at Provider Invocation</p>
                        <p className="text-[10px] text-amber-700 font-medium mt-0.5 leading-relaxed">
                           Provider Exotel returned 401 Unauthorized for trace ID #21. Check integration credentials.
                        </p>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <div className="space-y-6">
            <Card className="border-none bg-muted/10 shadow-none rounded-3xl p-2">
               <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-wider opacity-70">Provider Execution Analysis</CardTitle>
               </CardHeader>
               <CardContent>
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-border/50">
                           <th className="text-left py-2 text-[10px] font-black text-muted-foreground uppercase">Provider</th>
                           <th className="text-left py-2 text-[10px] font-black text-muted-foreground uppercase">Volume</th>
                           <th className="text-left py-2 text-[10px] font-black text-muted-foreground uppercase">Error Rate</th>
                           <th className="text-right py-2 text-[10px] font-black text-muted-foreground uppercase">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border/30">
                        {(stats?.providers || []).map((p: any, i: number) => (
                           <tr key={i} className="group hover:bg-muted/30 transition-colors">
                              <td className="py-4 text-sm font-bold">{p.name}</td>
                              <td className="py-4 text-xs font-medium text-muted-foreground">{p.volume} ops</td>
                              <td className="py-4">
                                 <div className="flex items-center gap-2">
                                    <span className={cn(
                                       "text-xs font-black",
                                       p.errorRate > 10 ? "text-rose-500" : "text-emerald-500"
                                    )}>{p.errorRate}%</span>
                                    <div className="h-1 w-12 bg-background rounded-full overflow-hidden border border-border/50">
                                       <div 
                                          className={cn("h-full", p.errorRate > 10 ? "bg-rose-500" : "bg-emerald-500")}
                                          style={{ width: `${p.errorRate}%` }}
                                       />
                                    </div>
                                 </div>
                              </td>
                              <td className="py-4 text-right">
                                 <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">Debug</Button>
                              </td>
                           </tr>
                        ))}
                        {(!stats?.providers || stats.providers.length === 0) && (
                           <tr>
                              <td colSpan={4} className="py-8 text-center text-xs text-muted-foreground">No provider data available.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </CardContent>
            </Card>

            <Card className="border-none bg-muted/10 shadow-none rounded-3xl p-2">
               <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-wider opacity-70">Active Alerts</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                  {(stats?.alerts || []).map((alert: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                        <div className="flex items-center gap-3 pl-1">
                           <div className="size-8 rounded-xl bg-rose-500/10 grid place-items-center text-rose-600">
                              <ShieldAlert className="size-4" />
                           </div>
                           <div>
                              <p className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                                 {alert.provider} API Failure
                                 <span className="text-[10px] font-bold opacity-40">Trace: {alert.traceId.slice(-4)}</span>
                              </p>
                              <p className="text-[10px] font-bold text-rose-600/70 truncate max-w-[200px]">{alert.message || 'Unauthorized (401)'}</p>
                           </div>
                        </div>
                        <span className="text-[9px] font-black opacity-30 group-hover:opacity-60">{new Date(alert.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                     </div>
                  ))}
                  {(!stats?.alerts || stats.alerts.length === 0) && (
                     <div className="py-6 text-center">
                        <p className="text-xs text-muted-foreground italic font-medium">System healthy. No active alerts.</p>
                     </div>
                  )}
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, trend, trendUp }: any) {
  return (
    <Card className="border-none bg-muted/10 shadow-none rounded-3xl p-2 group hover:bg-muted/20 transition-all cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
         <div className="size-8 rounded-xl bg-background grid place-items-center border border-border/50 group-hover:border-primary/20 transition-colors">
            {icon}
         </div>
         <Badge variant="outline" className={cn(
            "border-none text-[10px] font-black flex items-center gap-1 rounded-full px-2 py-0.5",
            trendUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
         )}>
            {trendUp ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
            {trend}
         </Badge>
      </CardHeader>
      <CardContent>
         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">{title}</p>
         <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black">{value}</span>
            <span className="text-[10px] font-bold text-muted-foreground italic">{subtitle}</span>
         </div>
      </CardContent>
    </Card>
  );
}
