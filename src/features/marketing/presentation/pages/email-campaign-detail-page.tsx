import { useParams, Navigate } from "@tanstack/react-router";
import { Cell, Pie, PieChart } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CampaignDetailHeader,
  RateCard,
  ConversionFunnel,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/shared/campaign-detail-shell";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { PerformanceBarChart } from "../components/shared/performance-chart";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

function OpenRateHeatmap({ data }: { data: { day: string; hours: number[] }[] }) {
  const maxVal = Math.max(...data.flatMap((d) => d.hours), 1);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="mb-2 flex gap-0.5 pl-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="w-5 text-center text-[9px] text-muted-foreground">
              {h % 6 === 0 ? `${h}h` : ""}
            </div>
          ))}
        </div>
        {data.map((row) => (
          <div key={row.day} className="mb-0.5 flex items-center gap-1">
            <span className="w-8 text-xs text-muted-foreground">{row.day}</span>
            <div className="flex gap-0.5">
              {row.hours.map((val, h) => (
                <div
                  key={h}
                  className={cn("size-5 rounded-sm")}
                  style={{
                    backgroundColor: `hsl(var(--chart-1) / ${0.1 + (val / maxVal) * 0.9})`,
                  }}
                  title={`${row.day} ${h}:00 — ${val}% open rate`}
                />
              ))}
            </div>
          </div>
        ))}
        <p className="mt-2 text-xs text-muted-foreground">Darker = higher open rate by hour</p>
      </div>
    </div>
  );
}

export function EmailCampaignDetailPage() {
  const { id } = useParams({ strict: false });
  const campaign = useMarketingStore((s) => s.emails.find((c) => c.id === id));

  if (!campaign) {
    return <Navigate to="/email-campaigns" />;
  }

  const { stats } = campaign;
  const funnelSteps = [
    { label: "Sent", value: stats.sent, color: "#3b82f6" },
    { label: "Delivered", value: stats.delivered, color: "#22c55e" },
    { label: "Opened", value: stats.opened, color: "#f97316" },
    { label: "Clicked", value: stats.clicked, color: "#a855f7" },
    { label: "Converted", value: stats.converted, color: "#14b8a6" },
  ];

  const bounceData = [
    { name: "Hard bounce", value: campaign.bounces.hard, fill: "#ef4444" },
    { name: "Soft bounce", value: campaign.bounces.soft, fill: "#f97316" },
  ];

  const bounceConfig: ChartConfig = {
    hard: { label: "Hard", color: "#ef4444" },
    soft: { label: "Soft", color: "#f97316" },
  };

  return (
    <div className="space-y-8 pb-12">
      <RoadmapBanner />

      <CampaignDetailHeader
        name={campaign.name}
        status={campaign.status}
        subtitle={`${campaign.fromName} <${campaign.fromEmail}>`}
        backTo="/email-campaigns"
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Performance</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-8 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RateCard title="Open Rate" rate={campaign.openRate} color="#f97316" formula="Opened / Delivered" />
        <RateCard title="Click Rate" rate={campaign.clickRate} color="#a855f7" formula="Clicked / Opened" />
        <RateCard title="Bounce Rate" rate={campaign.bounceRate} color="#ef4444" formula="Bounced / Sent" />
        <RateCard title="Unsubscribe Rate" rate={campaign.unsubscribeRate} color="#64748b" formula="Unsubscribed / Delivered" />
      </div>

      {stats.sent > 0 ? (
        <>
          <ConversionFunnel steps={funnelSteps} />

          {campaign.hasAbTest && campaign.abVariants ? (
            <Card>
              <CardHeader>
                <CardTitle>A/B Subject Test</CardTitle>
                <CardDescription>Variant performance comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceBarChart
                  data={campaign.abVariants.map((v) => ({
                    label: `Variant ${v.variant}`,
                    value: v.openRate,
                    value2: v.clickRate,
                  }))}
                  dataKey="value"
                  dataKey2="value2"
                />
                <div className="mt-4 space-y-2 text-sm">
                  {campaign.abVariants.map((v) => (
                    <p key={v.variant}>
                      <span className="font-medium">Variant {v.variant}:</span>{" "}
                      <span className="text-muted-foreground">{v.subject}</span>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Open Rate Heatmap</CardTitle>
              <CardDescription>Best send times by day and hour</CardDescription>
            </CardHeader>
            <CardContent>
              <OpenRateHeatmap data={campaign.openHeatmap} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Link Clicks</CardTitle>
                <CardDescription>Top performing links</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Unique</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.linkClicks.map((l) => (
                      <TableRow key={l.url}>
                        <TableCell className="font-mono text-xs">{l.url}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.clicks}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.uniqueClicks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bounce Analysis</CardTitle>
                <CardDescription>Hard vs soft bounces</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={bounceConfig} className="mx-auto h-[200px] w-full max-w-[200px]">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={bounceData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                      {bounceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <span>Hard: {campaign.bounces.hard}</span>
                  <span>Soft: {campaign.bounces.soft}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Client Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaign.clients.map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">{c.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {campaign.recipients.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recipient Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Opens</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead>Last activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaign.recipients.map((r) => (
                      <TableRow key={r.email}>
                        <TableCell className="font-mono text-sm">{r.email}</TableCell>
                        <TableCell className="text-right">{r.opens}</TableCell>
                        <TableCell className="text-right">{r.clicks}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(r.lastActivity).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Analytics will appear once the campaign is sent.
          </CardContent>
        </Card>
      )}
        </TabsContent>
        <TabsContent value="audience" className="mt-6">
          <AudiencePanel audience={defaultAudience("Enterprise subscribers", campaign.listSize)} />
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
