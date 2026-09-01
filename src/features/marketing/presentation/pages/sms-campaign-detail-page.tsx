import { useParams, Navigate } from "@tanstack/react-router";
import { ShieldCheckIcon } from "lucide-react";
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
import { PerformanceAreaChart } from "../components/shared/performance-chart";
import { DeliveryLogTable } from "../components/shared/delivery-log-table";
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

export function SmsCampaignDetailPage() {
  const { id } = useParams({ strict: false });
  const campaign = useMarketingStore((s) => s.sms.find((c) => c.id === id));

  if (!campaign) {
    return <Navigate to="/sms-campaigns" />;
  }

  const { stats } = campaign;
  const funnelSteps = [
    { label: "Queued", value: stats.queued, color: "#6366f1" },
    { label: "Sent", value: stats.sent, color: "#22c55e" },
    { label: "Delivered", value: stats.delivered, color: "#a855f7" },
    { label: "Clicked", value: stats.clicked, color: "#f97316" },
    { label: "Converted", value: stats.converted, color: "#14b8a6" },
  ];

  const timelineData = campaign.timeline.map((t) => ({
    label: t.hour,
    value: t.delivered,
    value2: t.failed,
  }));

  return (
    <div className="space-y-8 pb-12">
      <RoadmapBanner />

      <CampaignDetailHeader
        name={campaign.name}
        status={campaign.status}
        subtitle={`Sender: ${campaign.senderId} · ${campaign.audienceSize.toLocaleString()} recipients`}
        backTo="/sms-campaigns"
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
        <RateCard title="Delivery Rate" rate={campaign.deliveryRate} color="#a855f7" formula="Delivered / Sent" />
        <RateCard title="Click-through" rate={campaign.clickRate} color="#f97316" formula="Clicked / Delivered" />
        <RateCard title="Opt-out Rate" rate={campaign.optOutRate} color="#ef4444" formula="Opt-outs / Delivered" />
        <RateCard title="Failure Rate" rate={campaign.failureRate} color="#64748b" formula="Failed / Sent" />
      </div>

      {stats.sent > 0 ? (
        <>
          <ConversionFunnel steps={funnelSteps} />

          {timelineData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Timeline</CardTitle>
                <CardDescription>Hourly delivery over campaign period</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceAreaChart
                  data={timelineData}
                  dataKey="value"
                  dataKey2="value2"
                  color="#a855f7"
                  color2="#ef4444"
                />
              </CardContent>
            </Card>
          ) : null}

          {campaign.carriers.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Carrier Breakdown</CardTitle>
                <CardDescription>Delivery performance by telecom operator</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Carrier</TableHead>
                        <TableHead className="text-right">Sent</TableHead>
                        <TableHead className="text-right">Delivered</TableHead>
                        <TableHead className="text-right">Failed</TableHead>
                        <TableHead className="text-right">Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaign.carriers.map((c) => (
                        <TableRow key={c.name}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.sent.toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.delivered.toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.failed.toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {c.sent > 0 ? `${((c.delivered / c.sent) * 100).toFixed(1)}%` : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {campaign.deliveryLog.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Log</CardTitle>
                <CardDescription>Recent message delivery events</CardDescription>
              </CardHeader>
              <CardContent>
                <DeliveryLogTable entries={campaign.deliveryLog} />
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="size-5 text-muted-foreground" />
            Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">DND numbers scrubbed</p>
            <p className="text-2xl font-bold tabular-nums">{campaign.dndScrubbed.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">TRAI Template ID</p>
            <p className="font-mono text-sm">{campaign.traiTemplateId ?? "Pending registration"}</p>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="audience" className="mt-6">
          <AudiencePanel audience={defaultAudience("Enterprise CXO", campaign.audienceSize, campaign.dndScrubbed)} />
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
