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
