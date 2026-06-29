export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';

export type ExecutionMode = 'NOW' | 'SCHEDULED';

export interface Campaign {
  id: string;
  orgId: string;
  name: string;
  flowId: string;
  scheduleTime: string | null;
  status: CampaignStatus;
  activeVersionId: string | null;
  dataSourceId?: string | null;
  tableName?: string | null;
  fieldMapping?: Record<string, any>;
  filters?: any;
  createdAt: string;
  updatedAt: string;
  flow?: {
    creator?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface CreateCampaignResponse {
  campaign: Campaign;
  version: any;
}

export interface CreateCampaignInput {
  name: string;
  flowId: string;
  filePath?: string;
  dataSourceId?: string;
  tableName?: string;
  fieldMapping?: Record<string, any>;
  filters?: string[];
  scheduleTime?: string;
}

export interface VerifiedFunnel {
  /** Cumulative: sent + everything past it. */
  sent: number;
  /** Cumulative: delivered + read + replied. */
  delivered: number;
  /** Cumulative: read + replied. */
  read: number;
  replied: number;
  failed: number;
  pending: number;
  /** Mutually-exclusive current-state counts. */
  currentSent: number;
  currentDelivered: number;
  currentRead: number;
}

export interface FailureBreakdown {
  byCategory: Record<string, number>;
  byCode: Array<{ code: string; category: string | null; reason: string | null; count: number }>;
}

export interface RecipientStats {
  total: number;
  initiated: number;
  sent: number;
  delivered: number;
  opened: number;
  started: number;
  completed: number;
  failed: number;
  pending: number;
  queued: number;
  read?: number;
  replied?: number;
  /** Verified, webhook-derived mutually-exclusive funnel (when analytics pipeline is enabled). */
  verified?: VerifiedFunnel;
  /** Failure breakdown by KARIX category and code (when analytics pipeline is enabled). */
  failureBreakdown?: FailureBreakdown;
  /** Whether engagement metrics come from verified webhook funnel or legacy counters. */
  analyticsSource?: 'verified' | 'legacy' | 'filtered';
}

export interface CampaignAnalyticsDateFilter {
  startDate?: string;
  endDate?: string;
}

export interface BatchRunRef {
  versionId: string;
  versionNumber: number;
  launchedAt: string;
}

export interface RenudgeForBatch {
  id: string;
  createdAt: string;
  scheduledAt: string | null;
  status: string;
  delayMinutes: number;
  bot?: { name: string };
  taskCount: number;
  executedCount: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  yesCount: number;
  noCount: number;
}

export interface CampaignRenudge {
  id: string;
  campaignId: string;
  botId: string;
  scheduledAt: string | null;
  status: string;
  delayMinutes: number;
  sentCount: number;
  failedCount: number;
  deliveredCount: number;
  readCount: number;
  yesCount: number;
  noCount: number;
  positiveButtonId: string | null;
  negativeButtonId: string | null;
  quietHourStart: string | null;
  quietHourEnd: string | null;
  createdAt: string;
  updatedAt: string;
  bot?: { name: string };
  runs: BatchRunRef[];
  primaryRun?: BatchRunRef;
}

export interface BatchAnalyticsResponse {
  batch: CampaignBatch;
  analytics: RecipientStats & { nps: null };
  renudges: RenudgeForBatch[];
}

export interface NpsData {
  score: number | null;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
  responseRate: number;
  distribution: Record<string, number>;
  trend: Array<{ date: string; score: number; responses: number }>;
  scale: { min: number; max: number };
}

export interface CampaignAnalytics {
  analytics: RecipientStats & {
    nps: NpsData | null;
  };
}

export interface BatchAnalytics {
  total: number;
  pending: number;
  sent: number;
  delivered: number;
  read: number;
  opened: number;
  replied: number;
  started: number;
  completed: number;
  failed: number;
}

export interface CampaignBatch {
  id: string;
  campaignId: string;
  versionNumber: number;
  launchedAt: string;
  startedAt?: string;
  endedAt?: string | null;
  targetCount: number;
  status: 'success' | 'failed' | 'running';
  successCount: number;
  failedCount: number;
  analytics: BatchAnalytics;
}

export interface CustomCampaignFilter {
  id: string;
  name: string;
  key: string;
  value: number;
}

export type CustomApiIngestPhase = "idle" | "starting" | "fetching" | "dispatching" | "finished";

/** Live CUSTOM_API pagination state derived from campaign.fieldMapping. */
export interface CustomApiIngestProgress {
  startPage: number;
  configuredEndPage: number | null;
  effectiveEndPage: number | null;
  /** Last page fetched this run; 0 means not started yet. */
  currentPage: number;
  apiTotalPages: number | null;
  ingestedThisRun: number;
  maxRecords: number | null;
  pageSize: number | null;
  pagesFetched: number;
  pagesInRange: number | null;
  pageProgressPct: number | null;
  phase: CustomApiIngestPhase;
  isActive: boolean;
}

export interface CampaignAuditLog {
  id: string;
  orgId: string | null;
  campaignId: string | null;
  campaignRecipientId: string | null;
  messageId: string | null;
  waId: string | null;
  bspName: string;
  eventType: string;
  level: 'info' | 'warning' | 'error' | string;
  category: string | null;
  status: string | null;
  mappedErrorCode: string | null;
  channelErrorCode: string | null;
  reason: string | null;
  eventAt: string | null;
  createdAt: string;
}

export interface CampaignAuditLogFilter {
  level?: string;
  category?: string;
  status?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface CampaignAuditLogSummary {
  total: number;
  byLevel: Record<string, number>;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface CampaignAuditLogResponse {
  logs: CampaignAuditLog[];
  total: number;
  summary: CampaignAuditLogSummary;
}

export type RecipientStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'completed'
  | 'delivered'
  | 'read'
  | 'replied';

export interface CampaignRecipient {
  id: string;
  waId: string;
  status: RecipientStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  readAt: string | null;
  repliedAt: string | null;
  createdAt: string;
  variables: Record<string, unknown> | null;
}

export interface CampaignRecipientsPage {
  total: number;
  nextCursor: string | null;
  recipients: CampaignRecipient[];
}

export interface ConversationMessage {
  direction: 'outbound' | 'inbound';
  nodeId: string;
  nodeType: string;
  kind: string;
  text?: string;
  mediaUrl?: string;
  caption?: string;
  options?: string[];
  at: string;
}

export interface RecipientConversation {
  recipient: {
    id: string;
    waId: string;
    status: RecipientStatus;
    sentAt: string | null;
    deliveredAt: string | null;
    readAt: string | null;
    repliedAt: string | null;
  };
  session: {
    id: string;
    status: string;
    flowId: string;
    currentNodeId: string;
    startedAt: string | null;
    updatedAt: string | null;
  } | null;
  messages: ConversationMessage[];
  reconstructed: boolean;
}
