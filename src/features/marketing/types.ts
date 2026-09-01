export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "scheduled"
  | "running"
  | "completed"
  | "paused"
  | "cancelled";

export type ApprovalDecision = "approved" | "pending" | "rejected";

export interface ApprovalStep {
  id: string;
  stage: string;
  owner: string;
  role: string;
  status: ApprovalDecision;
  decidedAt?: string;
  note?: string;
}

export interface AudienceSnapshot {
  segmentName: string;
  source: string;
  total: number;
  eligible: number;
  suppressed: number;
  dndScrubbed?: number;
}

export interface CampaignActivityEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
}

export type SocialPlatform = "linkedin" | "x" | "facebook" | "instagram";

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface SmsCampaign {
  id: string;
  name: string;
  senderId: string;
  message: string;
  audienceSize: number;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  deliveryRate: number;
  clickRate: number;
  optOutRate: number;
  failureRate: number;
  traiTemplateId?: string;
  dndScrubbed: number;
  stats: SmsCampaignStats;
  timeline: { hour: string; delivered: number; failed: number }[];
  carriers: { name: string; sent: number; delivered: number; failed: number }[];
  deliveryLog: SmsDeliveryLogEntry[];
}

export interface SmsCampaignStats {
  queued: number;
  sent: number;
  delivered: number;
  clicked: number;
  converted: number;
  failed: number;
  optOut: number;
}

export interface SmsDeliveryLogEntry {
  id: string;
  msisdn: string;
  status: "delivered" | "failed" | "pending" | "clicked";
  timestamp: string;
  carrier: string;
  errorCode?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  listSize: number;
  status: CampaignStatus;
  sentAt?: string;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  hasAbTest: boolean;
  stats: EmailCampaignStats;
  abVariants?: { variant: string; subject: string; openRate: number; clickRate: number }[];
  openHeatmap: { day: string; hours: number[] }[];
  linkClicks: { url: string; clicks: number; uniqueClicks: number }[];
  bounces: { hard: number; soft: number };
  clients: { name: string; opens: number; percentage: number }[];
  recipients: EmailRecipientActivity[];
}

export interface EmailCampaignStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
}

export interface EmailRecipientActivity {
  email: string;
  opens: number;
  clicks: number;
  lastActivity: string;
}

export interface SocialCampaign {
  id: string;
  name: string;
  objective: "awareness" | "engagement" | "traffic" | "leads";
  platforms: SocialPlatform[];
  postsCount: number;
  status: CampaignStatus;
  reach: number;
  impressions: number;
  engagementRate: number;
  followerGrowth: number;
  stats: SocialCampaignStats;
  platformStats: { platform: SocialPlatform; reach: number; engagement: number; posts: number }[];
  posts: SocialPost[];
  engagementTrend: { date: string; likes: number; comments: number; shares: number }[];
  demographics: {
    age: { range: string; percentage: number }[];
    gender: { label: string; percentage: number }[];
    locations: { city: string; percentage: number }[];
  };
  hashtags: { tag: string; uses: number; reach: number }[];
  calendar: { date: string; posts: { platform: SocialPlatform; status: "scheduled" | "published" }[] }[];
}

export interface SocialCampaignStats {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  caption: string;
  scheduledAt: string;
  status: "scheduled" | "published";
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagementRate: number;
}

export interface SentimentOverview {
  score: number;
  positive: number;
  neutral: number;
  negative: number;
  trend: { date: string; score: number; positive: number; neutral: number; negative: number }[];
  alerts: SentimentAlert[];
  sources: { channel: string; volume: number; sentiment: number }[];
  sourceTrend: { date: string; social: number; email: number; sms: number; whatsapp: number; reviews: number }[];
  topics: SentimentTopic[];
  wordFrequency: { word: string; count: number }[];
  geography: { region: string; sentiment: number; volume: number }[];
  mentions: SentimentMention[];
  thresholds: { negativeSpike: number; volumeDrop: number };
}

export interface SentimentAlert {
  id: string;
  type: "negative_spike" | "volume_drop" | "topic_alert";
  title: string;
  detail: string;
  timestamp: string;
  severity: "high" | "medium" | "low";
}

export interface SentimentTopic {
  id: string;
  name: string;
  sentiment: number;
  volume: number;
  trend: "up" | "down" | "stable";
}

export interface SentimentMention {
  id: string;
  source: string;
  snippet: string;
  sentiment: SentimentLabel;
  score: number;
  timestamp: string;
  topic?: string;
}
