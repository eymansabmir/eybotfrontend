import type { EmailCampaign } from "../types";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildHeatmap() {
  return days.map((day) => ({
    day,
    hours: Array.from({ length: 24 }, (_, h) => {
      const peak = h >= 9 && h <= 11 ? 0.8 : h >= 14 && h <= 16 ? 0.6 : h >= 19 && h <= 21 ? 0.5 : 0.1;
      return Math.round(peak * 100 * (0.7 + Math.random() * 0.3));
    }),
  }));
}

export const MOCK_EMAIL_CAMPAIGNS: EmailCampaign[] = [
  {
    id: "email-001",
    name: "Managed Services Quarterly Newsletter",
    subject: "Q1 2026: Managed Services trends shaping enterprise IT",
    fromName: "EY Managed Services",
    fromEmail: "managed.services@ey.com",
    listSize: 28400,
    status: "completed",
    sentAt: "2026-02-15T10:00:00Z",
    openRate: 26.4,
    clickRate: 4.8,
    bounceRate: 1.2,
    unsubscribeRate: 0.3,
    hasAbTest: false,
    stats: { sent: 28400, delivered: 28059, opened: 7408, clicked: 1347, converted: 312, bounced: 341, unsubscribed: 85 },
    openHeatmap: buildHeatmap(),
    linkClicks: [
      { url: "ey.com/ms-trends-report", clicks: 892, uniqueClicks: 756 },
      { url: "ey.com/book-consultation", clicks: 455, uniqueClicks: 398 },
      { url: "ey.com/case-studies/finops", clicks: 312, uniqueClicks: 287 },
      { url: "ey.com/webinar/register", clicks: 198, uniqueClicks: 176 },
      { url: "ey.com/unsubscribe", clicks: 85, uniqueClicks: 85 },
    ],
    bounces: { hard: 124, soft: 217 },
    clients: [
      { name: "Gmail", opens: 4120, percentage: 55.6 },
      { name: "Outlook", opens: 1890, percentage: 25.5 },
      { name: "Apple Mail", opens: 890, percentage: 12.0 },
      { name: "Mobile (other)", opens: 508, percentage: 6.9 },
    ],
    recipients: [
      { email: "r***.sharma@techcorp.in", opens: 3, clicks: 2, lastActivity: "2026-02-15T14:22:00Z" },
      { email: "a***.patel@financehub.com", opens: 2, clicks: 1, lastActivity: "2026-02-15T11:05:00Z" },
      { email: "s***.gupta@retailmax.co.in", opens: 1, clicks: 0, lastActivity: "2026-02-15T10:45:00Z" },
      { email: "m***.singh@healthplus.org", opens: 4, clicks: 3, lastActivity: "2026-02-16T09:12:00Z" },
      { email: "p***.kumar@manufacturing.in", opens: 1, clicks: 1, lastActivity: "2026-02-15T16:30:00Z" },
    ],
  },
  {
    id: "email-002",
    name: "FinOps Product Launch",
    subject: "Introducing EY FinOps Accelerator — cut cloud waste by 35%",
    fromName: "EY FinOps Team",
    fromEmail: "finops@ey.com",
    listSize: 15200,
    status: "completed",
    sentAt: "2026-02-20T08:30:00Z",
    openRate: 28.1,
    clickRate: 5.2,
    bounceRate: 0.9,
    unsubscribeRate: 0.2,
    hasAbTest: true,
    stats: { sent: 15200, delivered: 15063, opened: 4233, clicked: 783, converted: 156, bounced: 137, unsubscribed: 30 },
    abVariants: [
      { variant: "A", subject: "Introducing EY FinOps Accelerator — cut cloud waste by 35%", openRate: 29.4, clickRate: 5.8 },
      { variant: "B", subject: "Your cloud bill is hiding savings — here's how to find them", openRate: 26.8, clickRate: 4.6 },
    ],
    openHeatmap: buildHeatmap(),
    linkClicks: [
      { url: "ey.com/finops-accelerator", clicks: 512, uniqueClicks: 467 },
      { url: "ey.com/cloud-cost-calculator", clicks: 271, uniqueClicks: 245 },
    ],
    bounces: { hard: 52, soft: 85 },
    clients: [
      { name: "Gmail", opens: 2340, percentage: 55.3 },
      { name: "Outlook", opens: 1080, percentage: 25.5 },
      { name: "Apple Mail", opens: 510, percentage: 12.0 },
      { name: "Mobile (other)", opens: 303, percentage: 7.2 },
    ],
    recipients: [
      { email: "c***.mehta@cloudfirst.io", opens: 2, clicks: 2, lastActivity: "2026-02-20T09:15:00Z" },
      { email: "d***.verma@startup.in", opens: 1, clicks: 1, lastActivity: "2026-02-20T08:55:00Z" },
    ],
  },
  {
    id: "email-003",
    name: "Cyber Security Summit Invite",
    subject: "You're invited: EY Cyber Summit 2026 — Mumbai, Apr 15",
    fromName: "EY Cyber",
    fromEmail: "cyber.events@ey.com",
    listSize: 8900,
    status: "running",
    sentAt: "2026-02-28T06:00:00Z",
    openRate: 22.8,
    clickRate: 3.9,
    bounceRate: 1.5,
    unsubscribeRate: 0.4,
    hasAbTest: false,
    stats: { sent: 8900, delivered: 8767, opened: 1999, clicked: 342, converted: 89, bounced: 133, unsubscribed: 36 },
    openHeatmap: buildHeatmap(),
    linkClicks: [
      { url: "ey.com/cyber-summit-2026", clicks: 298, uniqueClicks: 267 },
      { url: "ey.com/summit-agenda", clicks: 44, uniqueClicks: 41 },
    ],
    bounces: { hard: 48, soft: 85 },
    clients: [
      { name: "Gmail", opens: 1110, percentage: 55.5 },
      { name: "Outlook", opens: 510, percentage: 25.5 },
      { name: "Apple Mail", opens: 240, percentage: 12.0 },
      { name: "Mobile (other)", opens: 139, percentage: 7.0 },
    ],
    recipients: [],
  },
  {
    id: "email-004",
    name: "Re-engagement: Dormant Contacts",
    subject: "We miss you — here's what's new at EY Managed Services",
    fromName: "EY Managed Services",
    fromEmail: "managed.services@ey.com",
    listSize: 4200,
    status: "completed",
    sentAt: "2026-01-30T12:00:00Z",
    openRate: 18.6,
    clickRate: 2.1,
    bounceRate: 3.8,
    unsubscribeRate: 1.2,
    hasAbTest: true,
    stats: { sent: 4200, delivered: 4040, opened: 751, clicked: 85, converted: 12, bounced: 160, unsubscribed: 50 },
    abVariants: [
      { variant: "A", subject: "We miss you — here's what's new at EY Managed Services", openRate: 19.2, clickRate: 2.4 },
      { variant: "B", subject: "Your peers are adopting Managed Services — see why", openRate: 18.0, clickRate: 1.8 },
    ],
    openHeatmap: buildHeatmap(),
    linkClicks: [{ url: "ey.com/whats-new", clicks: 85, uniqueClicks: 78 }],
    bounces: { hard: 98, soft: 62 },
    clients: [
      { name: "Gmail", opens: 417, percentage: 55.5 },
      { name: "Outlook", opens: 191, percentage: 25.4 },
      { name: "Apple Mail", opens: 90, percentage: 12.0 },
      { name: "Mobile (other)", opens: 53, percentage: 7.1 },
    ],
    recipients: [],
  },
  {
    id: "email-005",
    name: "GCC Capability Centre Guide",
    subject: "The definitive guide to building a Global Capability Centre",
    fromName: "EY GCC Practice",
    fromEmail: "gcc@ey.com",
    listSize: 6700,
    status: "scheduled",
    sentAt: undefined,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
    hasAbTest: false,
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, bounced: 0, unsubscribed: 0 },
    openHeatmap: buildHeatmap(),
    linkClicks: [],
    bounces: { hard: 0, soft: 0 },
    clients: [],
    recipients: [],
  },
  {
    id: "email-006",
    name: "Tax Transformation Event",
    subject: "Digital Tax Operations — live demo this Thursday",
    fromName: "EY Tax Technology",
    fromEmail: "tax.digital@ey.com",
    listSize: 11300,
    status: "draft",
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
    hasAbTest: false,
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, bounced: 0, unsubscribed: 0 },
    openHeatmap: buildHeatmap(),
    linkClicks: [],
    bounces: { hard: 0, soft: 0 },
    clients: [],
    recipients: [],
  },
];

export function getEmailCampaignById(id: string): EmailCampaign | undefined {
  return MOCK_EMAIL_CAMPAIGNS.find((c) => c.id === id);
}

export const EMAIL_LIST_SUMMARY = {
  sent30d: 52500,
  avgOpenRate: 24.0,
  bounceRate: 1.4,
  unsubscribeRate: 0.4,
};

export const EMAIL_TEMPLATES = [
  { id: "newsletter", name: "Newsletter", description: "Multi-section layout with hero, articles, and CTA" },
  { id: "product-launch", name: "Product Launch", description: "Bold hero image with feature highlights" },
  { id: "event-invite", name: "Event Invite", description: "Date, venue, agenda with RSVP button" },
  { id: "re-engagement", name: "Re-engagement", description: "Win-back layout with personalized content blocks" },
];
