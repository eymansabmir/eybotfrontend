import { useState } from "react";
import { PhoneCall, Database, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EntitiesTab } from "../components/tabs/entities-tab";
import { RoutingTab } from "../components/tabs/routing-tab";

export function VoiceTechPage() {
  const [tenantId, setTenantId] = useState("tenant-ey-001");
  const [activeTab, setActiveTab] = useState("entities");
  const [entityType, setEntityType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* ── Header: User-Centric Workspace ────────────────────────── */}
      <div className="flex items-center justify-between pb-2 border-b">
        <div className="flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-primary shadow-sm shadow-primary/20 flex items-center justify-center text-primary-foreground">
            <PhoneCall className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h1 className="text-xl font-black tracking-tight text-foreground/90 uppercase">Orchestration</h1>
               <Badge variant="outline" className="text-[10px] bg-muted/50 font-bold uppercase tracking-widest px-1.5 h-5">V: 2.1.0-STABLE</Badge>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5 tracking-tight">Active Logic Control & Knowledge Base Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r">
             <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">Workspace</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-xs font-mono font-bold">{tenantId}</p>
                </div>
             </div>
             <Input
               value={tenantId}
               onChange={(e) => setTenantId(e.target.value)}
               className="h-8 w-32 text-xs font-mono bg-muted/30 border-none shadow-none focus-visible:ring-1"
               placeholder="tenant-id"
             />
          </div>
          
          <div className="flex items-center gap-2">
             <div className="size-8 rounded-full bg-muted grid place-items-center">
                <Settings2 className="size-4 text-muted-foreground" />
             </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-9 p-1 bg-muted/40 rounded-lg w-auto inline-flex">
          <TabsTrigger value="entities" className="gap-1.5 text-xs font-semibold px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Database className="size-3.5" />
            Datasets
          </TabsTrigger>
          <TabsTrigger value="routing" className="gap-1.5 text-xs font-semibold px-4 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Settings2 className="size-3.5" />
            Routing Rules
          </TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="entities" className="focus-visible:outline-none m-0">
            <EntitiesTab
              tenantId={tenantId}
              entityType={entityType ?? ""}
              onEntityTypeChange={setEntityType}
            />
          </TabsContent>

          <TabsContent value="routing" className="focus-visible:outline-none m-0">
            <RoutingTab
              tenantId={tenantId}
              entityType={entityType}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
