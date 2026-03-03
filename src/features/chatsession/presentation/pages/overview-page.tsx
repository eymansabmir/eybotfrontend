import { ActivityIcon, MessageCircleIcon, WorkflowIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import type { ChatSessionSummary, NodeStat } from "@/features/chatsession/domain"

const mockSummary: ChatSessionSummary = {
  active: 42,
  waiting: 18,
  completedToday: 126,
  avgResponseTime: 18,
}

const mockNodes: NodeStat[] = [
  { id: "greeting", label: "Greeting", conversionRate: 98, dropOffRate: 1 },
  { id: "qualification", label: "Qualification", conversionRate: 76, dropOffRate: 8 },
  { id: "handoff", label: "Handoff", conversionRate: 32, dropOffRate: 41 },
]

export function ChatSessionOverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Realtime Ops</p>
          <h1 className="text-3xl font-semibold tracking-tight">Chat session health</h1>
        </div>
        <Badge variant="outline" className="text-xs uppercase">
          Live Workspace
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Active" value={mockSummary.active} delta="+12%" accent="success" />
        <MetricCard label="Waiting" value={mockSummary.waiting} delta="-4%" accent="warning" />
        <MetricCard label="Completed today" value={mockSummary.completedToday} delta="+8%" accent="info" />
        <MetricCard label="Avg response" value={`${mockSummary.avgResponseTime}s`} delta="-2%" accent="default" />
      </div>

      <Card className="border-dashed">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <WorkflowIcon className="text-muted-foreground" />
          <div>
            <CardTitle>Node conversion</CardTitle>
            <CardDescription>Track drop-offs through the flow graph</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockNodes.map((node) => (
            <div key={node.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{node.label}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-muted-foreground">{node.conversionRate}% pass</span>
                </div>
                <span className="text-destructive text-xs">{node.dropOffRate}% drop</span>
              </div>
              <Progress value={node.conversionRate} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="text-muted-foreground" />
            Live queue
          </CardTitle>
          <CardDescription>Incoming WhatsApp sessions needing agent follow-up</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((entry) => (
            <div key={entry} className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium leading-none">Contact #{entry}</p>
                  <p className="text-sm text-muted-foreground">Meta line • Workflow A</p>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <MessageCircleIcon className="size-3" /> waiting input
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | number
  delta: string
  accent: "success" | "warning" | "info" | "default"
}

function MetricCard({ label, value, delta, accent }: MetricCardProps) {
  const tone: Record<MetricCardProps["accent"], string> = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    info: "text-blue-500",
    default: "text-muted-foreground",
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-sm font-medium ${tone[accent]}`}>{delta} vs last hour</p>
      </CardContent>
    </Card>
  )
}
