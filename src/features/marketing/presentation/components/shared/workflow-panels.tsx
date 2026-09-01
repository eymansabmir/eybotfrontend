import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApprovalStep, AudienceSnapshot, CampaignActivityEvent } from "../../../types";
import { cn } from "@/lib/utils";

const approvalTone: Record<ApprovalStep["status"], string> = {
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function AudiencePanel({ audience }: { audience: AudienceSnapshot }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Segment" value={audience.segmentName} detail={audience.source} />
      <Stat label="Total contacts" value={audience.total.toLocaleString()} />
      <Stat label="Eligible to send" value={audience.eligible.toLocaleString()} />
      <Stat
        label="Suppressed"
        value={audience.suppressed.toLocaleString()}
        detail={audience.dndScrubbed ? `${audience.dndScrubbed.toLocaleString()} DND scrubbed` : "Bounces, unsubscribes, frequency cap"}
      />
    </div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
      {detail ? <CardContent className="text-xs text-muted-foreground">{detail}</CardContent> : null}
    </Card>
  );
}

export function ApprovalsPanel({ steps }: { steps: ApprovalStep[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval chain</CardTitle>
        <CardDescription>Standard marketing ops gate: compliance → brand → delivery</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stage</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>
                  <p className="font-medium">{step.stage}</p>
                  <p className="text-xs text-muted-foreground">{step.role}</p>
                </TableCell>
                <TableCell>{step.owner}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("capitalize", approvalTone[step.status])}>
                    {step.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {step.note ?? (step.status === "pending" ? "Waiting on reviewer" : "—")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ActivityPanel({ events }: { events: CampaignActivityEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Audit trail for setup, approval, and delivery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
            <div className="w-40 shrink-0 text-xs text-muted-foreground">
              {new Date(event.at).toLocaleString()}
            </div>
            <div>
              <p className="text-sm">{event.action}</p>
              <p className="text-xs text-muted-foreground">{event.actor}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
