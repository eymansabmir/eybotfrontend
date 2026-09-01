import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, BarChart3, Share2, TrendingUp, Calendar, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { SOCIAL_LIST_SUMMARY, platformLabels } from "../../data/social-campaigns.mock";
import type { CampaignStatus, SocialPlatform } from "../../types";
import { cn } from "@/lib/utils";

const platformColors: Record<SocialPlatform, string> = {
  linkedin: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  x: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  facebook: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  instagram: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
};

export function SocialCampaignListPage() {
  const navigate = useNavigate();
  const campaigns = useMarketingStore((s) => s.social);
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
          <h1 className="text-2xl font-bold text-foreground">Social Media Campaigns</h1>
        </div>
        <Button onClick={() => navigate({ to: "/social-campaigns/create" })} className="gap-2">
          <Plus className="size-4" />
          Create Campaign
        </Button>
      </div>

      <CampaignPipeline counts={counts} active={statusFilter} onChange={setStatusFilter} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiStatCard label="Total reach" value={SOCIAL_LIST_SUMMARY.totalReach} delta="+22% this month" deltaPositive icon={Share2} />
        <KpiStatCard label="Engagement rate" value={`${SOCIAL_LIST_SUMMARY.engagementRate}%`} delta="+0.6%" deltaPositive icon={TrendingUp} />
        <KpiStatCard label="Scheduled posts" value={SOCIAL_LIST_SUMMARY.scheduledPosts} icon={Calendar} />
        <KpiStatCard label="Active campaigns" value={SOCIAL_LIST_SUMMARY.activeCampaigns} icon={Radio} />
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Campaign</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead className="text-right">Posts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Reach</TableHead>
              <TableHead className="text-right">ER%</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.platforms.map((p) => (
                      <Badge key={p} variant="secondary" className={cn("text-xs", platformColors[p])}>
                        {platformLabels[p]}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{c.postsCount}</TableCell>
                <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.reach > 0 ? c.reach.toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {c.engagementRate > 0 ? `${c.engagementRate}%` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild className="gap-1">
                    <Link to="/social-campaigns/$id" params={{ id: c.id }}>
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
