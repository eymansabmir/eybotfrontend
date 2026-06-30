import { useState } from "react";
import { 
  Search, 
  Filter, 
  User, 
  Bot, 
  Megaphone, 
  Key, 
  Info,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { useActivityLogs } from "../../data/queries/use-activity-log";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  FLOW_CREATED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FLOW_UPDATED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FLOW_PUBLISHED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  FLOW_DELETED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  CAMPAIGN_CREATED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CAMPAIGN_STARTED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  CREDENTIAL_CREATED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CREDENTIAL_UPDATED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const ENTITY_ICONS: Record<string, any> = {
  FLOW: Bot,
  CAMPAIGN: Megaphone,
  CREDENTIAL: Key,
  ORGANIZATION: Info,
};

export function ActivityLogPage() {
  const { data: session } = authClient.useSession();
  const orgId = (session?.user as any)?.organizationId || "68b08633907a113536238290";

  const [filter, setFilter] = useState({
    limit: 20,
    offset: 0,
    entityType: undefined as string | undefined,
    action: undefined as string | undefined,
  });

  const { data, isLoading } = useActivityLogs({
    orgId,
    ...filter,
  });

  const totalPages = data ? Math.ceil(data.total / filter.limit) : 0;
  const currentPage = Math.floor(filter.offset / filter.limit) + 1;

  const handlePageChange = (page: number) => {
    setFilter(prev => ({ ...prev, offset: (page - 1) * prev.limit }));
  };

  const getEntityIcon = (type: string) => {
    const Icon = ENTITY_ICONS[type] || Info;
    return <Icon className="size-4" />;
  };

  const formatMetadata = (metadata: any) => {
    if (!metadata) return "-";
    if (typeof metadata === "string") return metadata;
    
    return Object.entries(metadata)
      .filter(([key]) => key !== 'displayUser')
      .map(([key, value]) => {
        const val = Array.isArray(value) ? value.join(", ") : String(value);
        return `${key}: ${val}`;
      })
      .join(" | ");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          Monitor all system activities and administrative actions within your organization.
        </p>
      </div>

      <Card className="border-none shadow-sm bg-background/50 backdrop-blur-sm ring-1 ring-border">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <Select 
                value={filter.entityType || "all"} 
                onValueChange={(v) => setFilter(p => ({ ...p, entityType: v === "all" ? undefined : v, offset: 0 }))}
              >
                <SelectTrigger className="w-40 bg-background/50 border-border/50">
                  <Filter className="mr-2 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="FLOW">Bots</SelectItem>
                  <SelectItem value="CAMPAIGN">Campaigns</SelectItem>
                  <SelectItem value="CREDENTIAL">Credentials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 border-border/50 bg-background/50">
                <Calendar className="mr-2 size-4" />
                Last 24 Hours
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[150px]">Entity</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[150px]">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : data?.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No activity logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">
                            {format(new Date(log.createdAt), "MMM d, yyyy")}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {format(new Date(log.createdAt), "HH:mm:ss")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="size-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                            {getEntityIcon(log.entityType)}
                          </div>
                          <span className="text-xs font-medium">{log.entityType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider py-0.5", ACTION_COLORS[log.action] || "bg-muted text-muted-foreground")}>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="text-xs text-muted-foreground truncate" title={formatMetadata(log.metadata)}>
                          {formatMetadata(log.metadata)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="size-3" />
                          </div>
                          <span className="text-xs font-medium truncate max-w-[100px]">
                            {log.metadata?.displayUser || "System"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">
              Showing {data?.logs.length || 0} of {data?.total || 0} activities
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={currentPage === 1 || isLoading}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="text-xs font-medium px-2">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={currentPage === totalPages || isLoading}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
