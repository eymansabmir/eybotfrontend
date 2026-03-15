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
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignResponse {
  campaign: Campaign;
  version: any;
}

export interface CreateCampaignInput {
  name: string;
  flowId: string;
  filePath: string;
  scheduleTime?: string;
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
