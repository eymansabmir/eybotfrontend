import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { integrationCredentialsApi } from "../api/credentials.api";
import { getErrorMessage } from "@/lib/utils";

export const credentialKeys = {
  all: ["credentials"] as const,
  list: (orgId: string) => [...credentialKeys.all, "list", orgId] as const,
};

export const useCredentials = (orgId: string) => {
  return useQuery({
    queryKey: credentialKeys.list(orgId),
    queryFn: () => integrationCredentialsApi.list(orgId),
  });
};

export const useDeleteCredential = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) =>
      integrationCredentialsApi.delete(orgId, credentialId),
    onSuccess: () => {
      toast.success("Credential deleted successfully");
      void queryClient.invalidateQueries({ queryKey: credentialKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete credential"));
    },
  });
};

export const useRevokeCredential = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) =>
      integrationCredentialsApi.revoke(orgId, credentialId),
    onSuccess: () => {
      toast.success("Credential revoked");
      void queryClient.invalidateQueries({ queryKey: credentialKeys.all });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to revoke credential"));
    },
  });
};
