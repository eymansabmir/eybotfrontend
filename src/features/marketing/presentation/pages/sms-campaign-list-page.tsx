import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, BarChart3, Send, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { KpiStatCard } from "../components/shared/kpi-stat-card";
import { CampaignStatusBadge } from "../components/shared/campaign-status-badge";
import { CampaignPipeline } from "../components/shared/campaign-pipeline";
import { useMarketingStore } from "../../data/marketing-store";
import { SMS_LIST_SUMMARY } from "../../data/sms-campaigns.mock";
import type { CampaignStatus } from "../../types";

export function SmsCampaignListPage() {
  const navigate = useNavigate();
  const campaigns = useMarketingStore((s) => s.sms);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  const counts = useMemo(() => {
    const next: Partial<Record<CampaignStatus | "all", number>> = { all: campaigns.length };
    for (const c of campaigns) next[c.status] = (next[c.status] ?? 0) + 1;
    return next;
  }, [campaigns]);

  const filtered =
    statusFilter === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6 pb-8">
      <RoadmapBanner />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Marketing</p>
          <h1 className="text-2xl font-bold text-foreground">SMS Campaigns</h1>
        </div>
        <Button onClick={() => navigate({ to: "/sms-campaigns/create" })} className="gap-2">
          <Plus className="size-4" />
          Create SMS Campaign
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard label="Sent (24h)" value={SMS_LIST_SUMMARY.sent24h} delta="+8% vs yesterday" deltaPositive icon={Send} />
        <KpiStatCard label="Avg delivery rate" value={`${SMS_LIST_SUMMARY.avgDeliveryRate}%`} delta="+0.4%" deltaPositive icon={CheckCircle} />
        <KpiStatCard label="Opt-out rate" value={`${SMS_LIST_SUMMARY.optOutRate}%`} delta="-0.2%" deltaPositive icon={AlertTriangle} />
        <KpiStatCard label="Failed" value={SMS_LIST_SUMMARY.failedCount} delta="+12 today" deltaPositive={false} icon={XCircle} />
      </div>

      <CampaignPipeline counts={counts} active={statusFilter} onChange={setStatusFilter} />

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(["draft", "pending_approval", "scheduled", "running", "completed", "paused"] as CampaignStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Campaign</TableHead>
              <TableHead>Sender ID</TableHead>
              <TableHead className="text-right">Audience</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Delivery</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono text-sm">{c.senderId}</TableCell>
                <TableCell className="text-right tabular-nums">{c.audienceSize.toLocaleString()}</TableCell>
                <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.sentAt
                    ? new Date(c.sentAt).toLocaleDateString()
                    : c.scheduledAt
                      ? `Scheduled ${new Date(c.scheduledAt).toLocaleDateString()}`
                      : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.deliveryRate > 0 ? `${c.deliveryRate}%` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild className="gap-1">
                    <Link to="/sms-campaigns/$id" params={{ id: c.id }}>
                      <BarChart3 className="size-4" />
                      {c.status === "draft" || c.status === "pending_approval" ? "Open" : "Analytics"}
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
