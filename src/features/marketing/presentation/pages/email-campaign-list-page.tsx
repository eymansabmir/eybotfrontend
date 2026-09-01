import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, BarChart3, Mail, AlertCircle, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { KpiStatCard } from "../components/shared/kpi-stat-card";
import { CampaignStatusBadge } from "../components/shared/campaign-status-badge";
import { CampaignPipeline } from "../components/shared/campaign-pipeline";
import { useMarketingStore } from "../../data/marketing-store";
import { EMAIL_LIST_SUMMARY } from "../../data/email-campaigns.mock";
import type { CampaignStatus } from "../../types";

export function EmailCampaignListPage() {
  const navigate = useNavigate();
  const campaigns = useMarketingStore((s) => s.emails);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  const counts = useMemo(() => {
    const next: Partial<Record<CampaignStatus | "all", number>> = { all: campaigns.length };
    for (const c of campaigns) next[c.status] = (next[c.status] ?? 0) + 1;
    return next;
  }, [campaigns]);

  const filtered =
    statusFilter === "all" ? campaigns : campaigns.filter((c) => c.status === statusFilter);

  return (
    <div className="space-y-6 pb-8">
      <RoadmapBanner />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Marketing</p>
          <h1 className="text-2xl font-bold text-foreground">Email Campaigns</h1>
        </div>
        <Button onClick={() => navigate({ to: "/email-campaigns/create" })} className="gap-2">
          <Plus className="size-4" />
          Create Email Campaign
        </Button>
      </div>

      <CampaignPipeline counts={counts} active={statusFilter} onChange={setStatusFilter} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard label="Sent (30d)" value={EMAIL_LIST_SUMMARY.sent30d} delta="+15% vs prior month" deltaPositive icon={Mail} />
        <KpiStatCard label="Avg open rate" value={`${EMAIL_LIST_SUMMARY.avgOpenRate}%`} delta="+1.2%" deltaPositive icon={Mail} />
        <KpiStatCard label="Bounce rate" value={`${EMAIL_LIST_SUMMARY.bounceRate}%`} delta="-0.3%" deltaPositive icon={AlertCircle} />
        <KpiStatCard label="Unsubscribe rate" value={`${EMAIL_LIST_SUMMARY.unsubscribeRate}%`} delta="Stable" icon={UserMinus} />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Campaign</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">List size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Open</TableHead>
              <TableHead className="text-right">Click</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{c.subject}</TableCell>
                <TableCell className="text-right tabular-nums">{c.listSize.toLocaleString()}</TableCell>
                <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right tabular-nums">{c.openRate > 0 ? `${c.openRate}%` : "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{c.clickRate > 0 ? `${c.clickRate}%` : "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.sentAt ? new Date(c.sentAt).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild className="gap-1">
                    <Link to="/email-campaigns/$id" params={{ id: c.id }}>
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
