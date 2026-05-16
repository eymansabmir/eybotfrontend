import { apiClient } from "@/lib/api-client";

export interface ActivityLogFilter {
  orgId: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityLog {
  id: string;
  orgId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
}

export const activityLogApi = {
  getLogs: async (filter: ActivityLogFilter): Promise<ActivityLogResponse> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const { data } = await apiClient.get<ActivityLogResponse>(`/activity-logs?${params.toString()}`);
    return data;
  },

  getLogById: async (id: string): Promise<ActivityLog> => {
    const { data } = await apiClient.get<ActivityLog>(`/activity-logs/${id}`);
    return data;
  },
};
