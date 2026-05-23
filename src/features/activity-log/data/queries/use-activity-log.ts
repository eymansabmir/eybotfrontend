import { useQuery } from "@tanstack/react-query";
import { activityLogApi } from "../api/activity-log-api";
import type { ActivityLogFilter } from "../api/activity-log-api";

export const activityLogKeys = {
  all: ["activity-logs"] as const,
  lists: () => [...activityLogKeys.all, "list"] as const,
  list: (filter: ActivityLogFilter) => [...activityLogKeys.lists(), filter] as const,
  details: () => [...activityLogKeys.all, "detail"] as const,
  detail: (id: string) => [...activityLogKeys.details(), id] as const,
};

export function useActivityLogs(filter: ActivityLogFilter) {
  return useQuery({
    queryKey: activityLogKeys.list(filter),
    queryFn: () => activityLogApi.getLogs(filter),
    placeholderData: (previousData) => previousData,
  });
}

export function useActivityLog(id: string) {
  return useQuery({
    queryKey: activityLogKeys.detail(id),
    queryFn: () => activityLogApi.getLogById(id),
    enabled: !!id,
  });
}
