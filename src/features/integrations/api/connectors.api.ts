import { apiClient } from "@/lib/api-client";

export const connectorsApi = {
  // Data Sources
  listDataSources: async () => {
    const { data } = await apiClient.get("/v1/connectors/data-sources");
    return data;
  },
  createDataSource: async (payload: any) => {
    const { data } = await apiClient.post("/v1/connectors/data-sources", payload);
    return data;
  },
  deleteDataSource: async (id: string) => {
    await apiClient.delete(`/v1/connectors/data-sources/${id}`);
  },

  // Sync Jobs
  listSyncJobs: async (dataSourceId?: string) => {
    const { data } = await apiClient.get("/v1/connectors/sync-jobs", {
      params: { dataSourceId }
    });
    return data;
  },
  createSyncJob: async (payload: any) => {
    const { data } = await apiClient.post("/v1/connectors/sync-jobs", payload);
    return data;
  },
  runSyncJob: async (id: string) => {
    const { data } = await apiClient.post(`/v1/connectors/sync-jobs/${id}/run`);
    return data;
  },
  deleteSyncJob: async (id: string) => {
    await apiClient.delete(`/v1/connectors/sync-jobs/${id}`);
  }
};
