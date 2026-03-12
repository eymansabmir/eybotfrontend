export type CampaignStatus =
    | "DRAFT"
    | "PENDING"
    | "SCHEDULED"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED"
    | "PAUSED";

export type ExecutionMode = "NOW" | "SCHEDULED";

export interface Campaign {
    id: string;
    title: string;
    workspaceId: string;
    botId: string;
    filePath: string;
    mappedVariables: Record<string, unknown>;
    executionMode: ExecutionMode;
    executedAt: string | null;
    status: CampaignStatus;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCampaignInput {
    title: string;
    workspaceId: string;
    botId: string;
    filePath: string;
    mappedVariables?: Record<string, unknown>;
    executionMode?: ExecutionMode;
    executedAt?: string;
}

/** Analytics data returned by the backend */
export interface CampaignAnalytics {
    analytics: RecipientStats & {
        nps: NpsData | null;
    };
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
