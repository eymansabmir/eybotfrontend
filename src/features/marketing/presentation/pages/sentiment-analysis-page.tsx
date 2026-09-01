import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  MinusIcon,
  Plus,
  TrendingUpIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
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
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { KpiStatCard } from "../components/shared/kpi-stat-card";
import { MOCK_SENTIMENT } from "../../data/sentiment.mock";
import { useMarketingStore } from "../../data/marketing-store";
import type { SentimentLabel, SentimentTopic } from "../../types";
import { cn } from "@/lib/utils";

const sentimentBadge: Record<SentimentLabel, string> = {
  positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  negative: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function TrendIcon({ trend }: { trend: SentimentTopic["trend"] }) {
  if (trend === "up") return <ArrowUpIcon className="size-4 text-emerald-500" />;
  if (trend === "down") return <ArrowDownIcon className="size-4 text-red-500" />;
  return <MinusIcon className="size-4 text-muted-foreground" />;
}

export function SentimentAnalysisPage() {
  const navigate = useNavigate();
  const listenQueries = useMarketingStore((s) => s.listenQueries);
  const data = MOCK_SENTIMENT;

  const donutData = [
    { name: "Positive", value: data.positive, fill: "#22c55e" },
    { name: "Neutral", value: data.neutral, fill: "#94a3b8" },
    { name: "Negative", value: data.negative, fill: "#ef4444" },
  ];

  const donutConfig: ChartConfig = {
    positive: { label: "Positive", color: "#22c55e" },
    neutral: { label: "Neutral", color: "#94a3b8" },
    negative: { label: "Negative", color: "#ef4444" },
  };

  const trendChartData = data.trend.map((t) => ({
    date: t.date.slice(5),
    score: t.score,
  }));

  const sourceTrendData = data.sourceTrend.slice(-14).map((t) => ({
    date: t.date.slice(5),
    social: t.social,
    email: t.email,
    sms: t.sms,
    whatsapp: t.whatsapp,
    reviews: t.reviews,
  }));

  const sourceConfig: ChartConfig = {
    social: { label: "Social", color: "hsl(var(--chart-1))" },
    email: { label: "Email", color: "hsl(var(--chart-2))" },
    sms: { label: "SMS", color: "hsl(var(--chart-3))" },
    whatsapp: { label: "WhatsApp", color: "hsl(var(--chart-4))" },
    reviews: { label: "Reviews", color: "hsl(var(--chart-5))" },
  };

  const wordData = data.wordFrequency.slice(0, 8).map((w) => ({
    word: w.word,
    count: w.count,
  }));

  return (
    <div className="space-y-6 pb-8">
      <RoadmapBanner />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">Marketing</p>
          <h1 className="text-2xl font-bold text-foreground">Sentiment Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Listen topics first, then monitor mentions, spikes, and alerts
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate({ to: "/sentiment-analysis/create" })}>
          <Plus className="size-4" />
          Create listen query
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {listenQueries.map((q) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{q.name}</CardTitle>
                <Badge variant="secondary" className="capitalize">{q.status}</Badge>
              </div>
              <CardDescription className="font-mono text-[11px] line-clamp-2">{q.query}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{q.sources.join(" · ")}</p>
              <div className="flex justify-between">
                <span>{q.mentions24h} mentions / 24h</span>
                <span className="tabular-nums">Sentiment {q.sentiment}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiStatCard label="Sentiment score" value={data.score} delta="Overall health index (0–100)" icon={TrendingUpIcon} />
            <KpiStatCard label="Positive" value={`${data.positive}%`} deltaPositive icon={TrendingUpIcon} />
            <KpiStatCard label="Neutral" value={`${data.neutral}%`} icon={MinusIcon} />
            <KpiStatCard label="Negative" value={`${data.negative}%`} deltaPositive={false} icon={AlertTriangleIcon} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>30-Day Sentiment Trend</CardTitle>
                <CardDescription>Daily composite sentiment score</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ score: { label: "Score", color: "hsl(var(--chart-1))" } }} className="h-[280px] w-full">
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis domain={[40, 90]} tickLine={false} axisLine={false} fontSize={11} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Mix</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={donutConfig} className="mx-auto h-[200px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  {donutData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1">
                      <span className="size-2 rounded-full" style={{ backgroundColor: d.fill }} />
                      {d.name} {d.value}%
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>Automated sentiment anomaly detection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-lg border p-4">
                  <AlertTriangleIcon className={cn(
                    "size-5 shrink-0 mt-0.5",
                    alert.severity === "high" && "text-red-500",
                    alert.severity === "medium" && "text-amber-500",
                    alert.severity === "low" && "text-muted-foreground",
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <Badge variant="outline" className="text-xs capitalize">{alert.severity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.detail}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6 mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {data.sources.map((s) => (
              <KpiStatCard key={s.channel} label={s.channel} value={s.volume.toLocaleString()} delta={`Sentiment: ${s.sentiment}`} deltaPositive={s.sentiment >= 65} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Volume by Channel</CardTitle>
              <CardDescription>14-day mention volume trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={sourceConfig} className="h-[320px] w-full">
                <AreaChart data={sourceTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="var(--color-whatsapp)" fill="var(--color-whatsapp)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="social" stackId="1" stroke="var(--color-social)" fill="var(--color-social)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="email" stackId="1" stroke="var(--color-email)" fill="var(--color-email)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="reviews" stackId="1" stroke="var(--color-reviews)" fill="var(--color-reviews)" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="sms" stackId="1" stroke="var(--color-sms)" fill="var(--color-sms)" fillOpacity={0.6} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Topics & Entities</CardTitle>
              <CardDescription>Sentiment score, volume, and trend direction</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Sentiment</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.name}</TableCell>
                      <TableCell className={cn("text-right tabular-nums font-medium", topic.sentiment >= 65 ? "text-emerald-600" : topic.sentiment < 50 ? "text-red-600" : "")}>
                        {topic.sentiment}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{topic.volume.toLocaleString()}</TableCell>
                      <TableCell className="text-right"><TrendIcon trend={topic.trend} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Word Frequency</CardTitle>
              <CardDescription>Most mentioned terms across all channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ count: { label: "Mentions", color: "hsl(var(--chart-1))" } }} className="h-[280px] w-full">
                <BarChart data={wordData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis type="category" dataKey="word" tickLine={false} axisLine={false} fontSize={11} width={95} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Sentiment</CardTitle>
              <CardDescription>Sentiment score and mention volume by region</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.geography.map((g) => (
                    <TableRow key={g.region}>
                      <TableCell className="font-medium">{g.region}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 max-w-[120px] rounded-full bg-muted/50">
                            <div
                              className={cn("h-full rounded-full", g.sentiment >= 70 ? "bg-emerald-500" : g.sentiment >= 60 ? "bg-amber-500" : "bg-red-500")}
                              style={{ width: `${g.sentiment}%` }}
                            />
                          </div>
                          <span className="tabular-nums text-sm font-medium w-8">{g.sentiment}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{g.volume.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>Configure when automated alerts fire (preview only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Negative sentiment spike threshold</span>
                  <span className="font-medium">{data.thresholds.negativeSpike}%</span>
                </div>
                <Slider defaultValue={[data.thresholds.negativeSpike]} max={50} step={1} disabled />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Volume drop alert threshold</span>
                  <span className="font-medium">{data.thresholds.volumeDrop}%</span>
                </div>
                <Slider defaultValue={[data.thresholds.volumeDrop]} max={60} step={1} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Negative Mentions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.mentions.map((m) => (
                <div key={m.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{m.source}</Badge>
                      {m.topic ? <span className="text-xs text-muted-foreground">{m.topic}</span> : null}
                    </div>
                    <Badge variant="secondary" className={sentimentBadge[m.sentiment]}>
                      {m.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm">{m.snippet}</p>
                  <p className="text-xs text-muted-foreground">
                    Score: {m.score.toFixed(2)} · {new Date(m.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
