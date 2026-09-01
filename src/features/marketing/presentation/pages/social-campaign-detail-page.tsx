import { useParams, Navigate } from "@tanstack/react-router";
import { TrendingUpIcon, UsersIcon, EyeIcon, HeartIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  CampaignDetailHeader,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/shared/campaign-detail-shell";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { KpiStatCard } from "../components/shared/kpi-stat-card";
import { PerformanceAreaChart, PerformanceBarChart } from "../components/shared/performance-chart";
import { platformLabels } from "../../data/social-campaigns.mock";
import { useMarketingStore } from "../../data/marketing-store";
import { defaultActivity, defaultApprovals, defaultAudience } from "../../data/workflow.mock";
import { ActivityPanel, ApprovalsPanel, AudiencePanel } from "../components/shared/workflow-panels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "../../types";

const platformColors: Record<SocialPlatform, string> = {
  linkedin: "bg-blue-500",
  x: "bg-slate-600",
  facebook: "bg-indigo-500",
  instagram: "bg-pink-500",
};

function ContentCalendar({ calendar }: { calendar: { date: string; posts: { platform: SocialPlatform; status: string }[] }[] }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
      ))}
      {calendar.slice(0, 28).map((day) => (
        <div key={day.date} className="min-h-[60px] rounded border border-border/50 p-1">
          <p className="text-[10px] text-muted-foreground">{new Date(day.date).getDate()}</p>
          <div className="mt-1 flex flex-wrap gap-0.5">
            {day.posts.map((p, i) => (
              <div
                key={i}
                className={cn("size-2 rounded-full", platformColors[p.platform], p.status === "scheduled" && "opacity-40 ring-1 ring-dashed ring-foreground/30")}
                title={`${platformLabels[p.platform]} — ${p.status}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SocialCampaignDetailPage() {
  const { id } = useParams({ strict: false });
  const campaign = useMarketingStore((s) => s.social.find((c) => c.id === id));

  if (!campaign) {
    return <Navigate to="/social-campaigns" />;
  }

  const trendData = campaign.engagementTrend.map((t) => ({
    label: t.date.slice(5),
    value: t.likes,
    value2: t.comments + t.shares,
  }));

  const platformChartData = campaign.platformStats.map((p) => ({
    label: platformLabels[p.platform],
    value: p.engagement,
  }));

  return (
    <div className="space-y-8 pb-12">
      <RoadmapBanner />

      <CampaignDetailHeader
        name={campaign.name}
        status={campaign.status}
        subtitle={`Objective: ${campaign.objective} · ${campaign.platforms.map((p) => platformLabels[p]).join(", ")}`}
        backTo="/social-campaigns"
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiStatCard label="Reach" value={campaign.reach.toLocaleString()} icon={EyeIcon} />
            <KpiStatCard label="Impressions" value={campaign.impressions.toLocaleString()} icon={TrendingUpIcon} />
            <KpiStatCard label="Engagement rate" value={`${campaign.engagementRate}%`} icon={HeartIcon} />
            <KpiStatCard label="Follower growth" value={`+${campaign.followerGrowth.toLocaleString()}`} deltaPositive icon={UsersIcon} />
          </div>

          {platformChartData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
                <CardDescription>Engagement rate by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceBarChart data={platformChartData} />
              </CardContent>
            </Card>
          ) : null}

          {trendData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trend</CardTitle>
                <CardDescription>14-day likes and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceAreaChart data={trendData} dataKey="value" dataKey2="value2" />
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>Scheduled and published posts — dots indicate platform</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentCalendar calendar={campaign.calendar} />
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                {campaign.platforms.map((p) => (
                  <span key={p} className="flex items-center gap-1">
                    <span className={cn("size-2 rounded-full", platformColors[p])} />
                    {platformLabels[p]}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Post Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Caption</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Likes</TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Reach</TableHead>
                    <TableHead className="text-right">ER%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell><Badge variant="secondary">{platformLabels[post.platform]}</Badge></TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{post.caption}</TableCell>
                      <TableCell><Badge variant="outline">{post.status}</Badge></TableCell>
                      <TableCell className="text-right tabular-nums">{post.likes.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{post.comments}</TableCell>
                      <TableCell className="text-right tabular-nums">{post.shares}</TableCell>
                      <TableCell className="text-right tabular-nums">{post.reach.toLocaleString()}</TableCell>
                      <TableCell className="text-right tabular-nums">{post.engagementRate.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {campaign.hashtags.length > 0 ? (
            <Card className="mt-6">
              <CardHeader><CardTitle>Top Hashtags</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hashtag</TableHead>
                      <TableHead className="text-right">Uses</TableHead>
                      <TableHead className="text-right">Reach</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.hashtags.map((h) => (
                      <TableRow key={h.tag}>
                        <TableCell className="font-medium text-primary">{h.tag}</TableCell>
                        <TableCell className="text-right">{h.uses}</TableCell>
                        <TableCell className="text-right">{h.reach.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="audience" className="space-y-6 mt-6">
          {campaign.demographics.age.length > 0 ? (
            <>
              <Card>
                <CardHeader><CardTitle>Age Distribution</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {campaign.demographics.age.map((a) => (
                    <div key={a.range} className="space-y-1">
                      <div className="flex justify-between text-sm"><span>{a.range}</span><span>{a.percentage}%</span></div>
                      <div className="h-2 rounded-full bg-muted/50"><div className="h-full rounded-full bg-primary" style={{ width: `${a.percentage}%` }} /></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Top Locations</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {campaign.demographics.locations.map((l) => (
                    <div key={l.city} className="space-y-1">
                      <div className="flex justify-between text-sm"><span>{l.city}</span><span>{l.percentage}%</span></div>
                      <div className="h-2 rounded-full bg-muted/50"><div className="h-full rounded-full bg-chart-2" style={{ width: `${l.percentage * 3}%` }} /></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                Audience data will populate after campaign launch.
              </CardContent>
            </Card>
          )}
          <div className="pt-2">
            <AudiencePanel audience={defaultAudience("Targeting: CXO / IT leadership — India", 180000)} />
          </div>
        </TabsContent>
        <TabsContent value="approvals" className="mt-6">
          <ApprovalsPanel steps={defaultApprovals(campaign.status)} />
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <ActivityPanel events={defaultActivity(campaign.status, campaign.name)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
