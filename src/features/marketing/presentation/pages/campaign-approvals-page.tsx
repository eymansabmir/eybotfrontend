import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
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
import { CampaignStatusBadge } from "../components/shared/campaign-status-badge";
import { useMarketingStore } from "../../data/marketing-store";
import { defaultApprovals } from "../../data/workflow.mock";
import type { ApprovalQueueItem, CampaignStatus, MarketingChannel } from "../../types";
import { cn } from "@/lib/utils";

const channelLabel: Record<MarketingChannel, string> = {
  sms: "SMS",
  email: "Email",
  social: "Social",
};

const channelStyle: Record<MarketingChannel, string> = {
  sms: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  email: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  social: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300",
};

function waitingOn(status: CampaignStatus) {
  const pending = defaultApprovals(status).find((step) => step.status === "pending");
  return pending ? `${pending.owner} · ${pending.stage}` : "—";
}

export function CampaignApprovalsPage() {
  const sms = useMarketingStore((s) => s.sms);
  const emails = useMarketingStore((s) => s.emails);
  const social = useMarketingStore((s) => s.social);
  const setSmsStatus = useMarketingStore((s) => s.setSmsStatus);
  const setEmailStatus = useMarketingStore((s) => s.setEmailStatus);
  const setSocialStatus = useMarketingStore((s) => s.setSocialStatus);
  const [filter, setFilter] = useState<"pending_approval" | "all">("pending_approval");

  const rows = useMemo<ApprovalQueueItem[]>(() => {
    const items: ApprovalQueueItem[] = [
      ...sms.map((c) => ({
        id: c.id,
        channel: "sms" as const,
        name: c.name,
        status: c.status,
        audienceLabel: `${c.audienceSize.toLocaleString()} recipients`,
        waitingOn: waitingOn(c.status),
        submittedAt: c.scheduledAt ?? c.sentAt ?? "2026-02-26T09:15:00Z",
        href: `/sms-campaigns/${c.id}`,
      })),
      ...emails.map((c) => ({
        id: c.id,
        channel: "email" as const,
        name: c.name,
        status: c.status,
        audienceLabel: `${c.listSize.toLocaleString()} subscribers`,
        waitingOn: waitingOn(c.status),
        submittedAt: c.sentAt ?? "2026-02-26T09:15:00Z",
        href: `/email-campaigns/${c.id}`,
      })),
      ...social.map((c) => ({
        id: c.id,
        channel: "social" as const,
        name: c.name,
        status: c.status,
        audienceLabel: c.platforms.join(", "),
        waitingOn: waitingOn(c.status),
        submittedAt: "2026-02-26T09:15:00Z",
        href: `/social-campaigns/${c.id}`,
      })),
    ];
    return filter === "all" ? items : items.filter((item) => item.status === "pending_approval");
  }, [sms, emails, social, filter]);

  const setStatus = (item: ApprovalQueueItem, status: CampaignStatus) => {
    if (item.channel === "sms") setSmsStatus(item.id, status);
    if (item.channel === "email") setEmailStatus(item.id, status);
    if (item.channel === "social") setSocialStatus(item.id, status);
  };

  const handleApprove = (item: ApprovalQueueItem) => {
    setStatus(item, "scheduled");
    toast.success(`${item.name} approved and queued for launch.`);
  };

  const handleReject = (item: ApprovalQueueItem) => {
    setStatus(item, "cancelled");
    toast.message(`${item.name} rejected and moved to cancelled.`);
  };

  return (
    <div className="space-y-6 pb-8">
      <RoadmapBanner />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Marketing</p>
          <h1 className="text-2xl font-bold">Campaign approvals</h1>
          <p className="text-sm text-muted-foreground">
            Queue of campaigns waiting on compliance, brand, or delivery sign-off
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "pending_approval" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending_approval")}
          >
            Pending
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All campaigns
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Campaign</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Waiting on</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No campaigns in this queue.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => (
                <TableRow key={`${item.channel}-${item.id}`}>
                  <TableCell>
                    <Link to={item.href} className="font-medium hover:underline">{item.name}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn("capitalize", channelStyle[item.channel])}>
                      {channelLabel[item.channel]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.audienceLabel}</TableCell>
                  <TableCell className="text-sm">{item.waitingOn}</TableCell>
                  <TableCell><CampaignStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right">
                    {item.status === "pending_approval" ? (
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReject(item)}>
                          <X className="size-3.5" />
                          Reject
                        </Button>
                        <Button size="sm" className="gap-1" onClick={() => handleApprove(item)}>
                          <Check className="size-3.5" />
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={item.href}>Open</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
