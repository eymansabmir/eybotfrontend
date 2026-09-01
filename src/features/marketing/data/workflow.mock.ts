import type {
  ApprovalStep,
  AudienceSnapshot,
  CampaignActivityEvent,
  CampaignStatus,
} from "../types";

export const PIPELINE_STAGES: { id: CampaignStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "pending_approval", label: "Pending approval" },
  { id: "scheduled", label: "Scheduled" },
  { id: "running", label: "Running" },
  { id: "completed", label: "Completed" },
  { id: "paused", label: "Paused" },
];

export function defaultApprovals(status: CampaignStatus): ApprovalStep[] {
  const submitted = status !== "draft";
  const fullyApproved = ["scheduled", "running", "completed", "paused"].includes(status);

  return [
    {
      id: "legal",
      stage: "Compliance / legal",
      owner: "R. Iyer",
      role: "Compliance reviewer",
      status: submitted ? "approved" : "pending",
      decidedAt: submitted ? "2026-02-26T11:20:00Z" : undefined,
      note: submitted ? "Consent language and opt-out footer verified." : undefined,
    },
    {
      id: "brand",
      stage: "Brand & messaging",
      owner: "P. Shah",
      role: "Marketing lead",
      status: fullyApproved ? "approved" : submitted ? "pending" : "pending",
      decidedAt: fullyApproved ? "2026-02-27T09:05:00Z" : undefined,
      note: fullyApproved ? "Approved for launch window." : undefined,
    },
    {
      id: "ops",
      stage: "Delivery operations",
      owner: "A. Mehta",
      role: "Campaign ops",
      status: fullyApproved ? "approved" : "pending",
      decidedAt: fullyApproved ? "2026-02-27T14:40:00Z" : undefined,
    },
  ];
}

export function defaultAudience(name: string, total: number, dnd = 0): AudienceSnapshot {
  const suppressed = Math.round(total * 0.018) + dnd;
  return {
    segmentName: name,
    source: "CRM segment + suppression lists",
    total,
    eligible: Math.max(0, total - suppressed),
    suppressed,
    dndScrubbed: dnd || undefined,
  };
}

export function defaultActivity(status: CampaignStatus, name: string): CampaignActivityEvent[] {
  const events: CampaignActivityEvent[] = [
    { id: "1", at: "2026-02-24T10:12:00Z", actor: "A. Mehta", action: `Created campaign “${name}”` },
    { id: "2", at: "2026-02-25T16:40:00Z", actor: "A. Mehta", action: "Audience segment attached and suppression applied" },
  ];
  if (status !== "draft") {
    events.push({
      id: "3",
      at: "2026-02-26T09:15:00Z",
      actor: "A. Mehta",
      action: "Submitted for compliance and marketing approval",
    });
  }
  if (["scheduled", "running", "completed", "paused"].includes(status)) {
    events.push({
      id: "4",
      at: "2026-02-27T14:42:00Z",
      actor: "P. Shah",
      action: "All approvals complete — campaign queued for delivery",
    });
  }
  if (status === "running" || status === "completed" || status === "paused") {
    events.push({
      id: "5",
      at: "2026-02-28T08:00:00Z",
      actor: "System",
      action: "Delivery started",
    });
  }
  if (status === "completed") {
    events.push({
      id: "6",
      at: "2026-03-01T18:10:00Z",
      actor: "System",
      action: "Delivery completed — report generated",
    });
  }
  if (status === "paused") {
    events.push({
      id: "6",
      at: "2026-02-28T15:20:00Z",
      actor: "A. Mehta",
      action: "Campaign paused — opt-out spike threshold reached",
    });
  }
  return events.reverse();
}
