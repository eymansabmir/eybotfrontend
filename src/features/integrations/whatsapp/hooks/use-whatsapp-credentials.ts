import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsappCredentialsApi } from "../api/whatsapp-credentials.api";
import type { CreateWhatsAppCredentialInput } from "../domain/whatsapp.schemas";
import { toast } from "sonner";

type ApiLikeError = {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  const candidate = error as ApiLikeError;
  return candidate?.response?.data?.message || candidate?.message || fallback;
};

export const useWhatsAppCredentials = (orgId: string) => {
  return useQuery({
    queryKey: ["credentials", orgId, "WHATSAPP_CLOUD"],
    queryFn: () => whatsappCredentialsApi.list(orgId),
    enabled: !!orgId,
  });
};

export const useCreateWhatsAppCredential = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateWhatsAppCredentialInput, "orgId">) =>
      whatsappCredentialsApi.create({ ...input, orgId }),
    onSuccess: () => {
      toast.success("WhatsApp credential added successfully");
      queryClient.invalidateQueries({
        queryKey: ["credentials", orgId, "WHATSAPP_CLOUD"],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to add WhatsApp credential"));
    },
  });
};

export const useDeleteWhatsAppCredential = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) =>
      whatsappCredentialsApi.remove(orgId, credentialId),
    onSuccess: () => {
      toast.success("WhatsApp credential deleted");
      queryClient.invalidateQueries({
        queryKey: ["credentials", orgId, "WHATSAPP_CLOUD"],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete credential"));
    },
  });
};

export const useRevokeWhatsAppCredential = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentialId: string) =>
      whatsappCredentialsApi.revoke(orgId, credentialId),
    onSuccess: () => {
      toast.success("WhatsApp credential revoked");
      queryClient.invalidateQueries({
        queryKey: ["credentials", orgId, "WHATSAPP_CLOUD"],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to revoke credential"));
    },
  });
};
