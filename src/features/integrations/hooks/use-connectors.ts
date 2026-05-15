import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectorsApi } from "../api/connectors.api";

export const useDataSources = () => {
  return useQuery({
    queryKey: ["data-sources"],
    queryFn: connectorsApi.listDataSources,
  });
};

export const useSyncJobs = (dataSourceId?: string) => {
  return useQuery({
    queryKey: ["sync-jobs", dataSourceId],
    queryFn: () => connectorsApi.listSyncJobs(dataSourceId),
  });
};

export const useCreateDataSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectorsApi.createDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources"] });
    },
  });
};

export const useCreateSyncJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectorsApi.createSyncJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sync-jobs"] });
    },
  });
};

export const useRunSyncJob = () => {
  return useMutation({
    mutationFn: connectorsApi.runSyncJob,
  });
};

export const useDeleteDataSource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectorsApi.deleteDataSource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-sources"] });
    },
  });
};
