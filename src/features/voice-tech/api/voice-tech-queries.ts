import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { voiceTechApi } from "./voice-tech-api";
import { toast } from "sonner";
import type { IngestFileBody, IngestJobStatus } from "../types";
import type { CreateIntegrationCredentialInput } from "../types";
import { PROVIDER_TO_CREDENTIAL_TYPE } from "../types";
import type { VoiceProvider } from "../types";

// ─── Query Keys ──────────────────────────────────────────────────────
const VT_KEYS = {
  attributes: (tenantId: string, entityType?: string) =>
    ["voice-tech", "attributes", tenantId, entityType ?? "all"] as const,
  routingConfigs: (tenantId: string) =>
    ["voice-tech", "routing", tenantId] as const,
  routingConfig: (id: string, tenantId: string) =>
    ["voice-tech", "routing", tenantId, id] as const,
  jobStatus: (jobId: string) =>
    ["voice-tech", "job", jobId] as const,
  entityTypes: (tenantId: string) =>
    ["voice-tech", "entity-types", tenantId] as const,
  agents: (tenantId: string, credentialId?: string) =>
    ["voice-tech", "agents", tenantId, credentialId ?? "all"] as const,
};

// ─── Attributes & Categories ─────────────────────────────────────────

export function useVoiceTechAttributes(tenantId: string, entityType?: string) {
  return useQuery({
    queryKey: VT_KEYS.attributes(tenantId, entityType),
    queryFn: async () => {
      const data = await voiceTechApi.listAttributes({ tenantId, entityType });
      return data;
    },
    enabled: !!tenantId && !!entityType,
  });
}

export function useUpsertAttribute(tenantId: string, entityType: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { key: string; type: string; operators?: string[]; values?: unknown[] }) =>
      voiceTechApi.upsertAttribute({ ...payload, tenantId, entityType }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VT_KEYS.attributes(tenantId, entityType) });
      toast.success(`Attribute "${variables.key}" saved`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save attribute");
    },
  });
}

export function useEntityTypes(tenantId: string) {
  return useQuery({
    queryKey: VT_KEYS.entityTypes(tenantId),
    queryFn: () => voiceTechApi.listEntityTypes(tenantId),
    enabled: !!tenantId,
  });
}

export function useVoiceProviderCredentials(orgId: string, provider: VoiceProvider) {
  const type = PROVIDER_TO_CREDENTIAL_TYPE[provider];

  return useQuery({
    queryKey: ["voice-tech", "provider-credentials", orgId, provider],
    queryFn: () => voiceTechApi.listCredentialsByType(orgId, type),
    enabled: Boolean(orgId && provider),
    staleTime: 30_000,
  });
}

export function useCredentialsByType(orgId: string, type: string) {
  return useQuery({
    queryKey: ["voice-tech", "credentials-by-type", orgId, type],
    queryFn: () => voiceTechApi.listCredentialsByType(orgId, type),
    enabled: Boolean(orgId && type),
    staleTime: 30_000,
  });
}

export function useCreateIntegrationCredential(orgId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIntegrationCredentialInput) => voiceTechApi.createIntegrationCredential(input),
    onSuccess: (credential) => {
      toast.success(`Credential "${credential.name}" created`);
      qc.invalidateQueries({ queryKey: ["voice-tech", "credentials-by-type", orgId], exact: false });
      qc.invalidateQueries({ queryKey: ["voice-tech", "provider-credentials", orgId], exact: false });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create credential");
    },
  });
}

// ─── Routing Configs ─────────────────────────────────────────────────
export function useRoutingConfigs(tenantId: string) {
  return useQuery({
    queryKey: VT_KEYS.routingConfigs(tenantId),
    queryFn: () => voiceTechApi.listRoutingConfigs(tenantId),
    enabled: !!tenantId,
  });
}

/** Loads full config WITH rules — used when a config is selected */
export function useRoutingConfig(id: string | null, tenantId: string) {
  return useQuery({
    queryKey: VT_KEYS.routingConfig(id ?? "", tenantId),
    queryFn: () => voiceTechApi.getRoutingConfig(id!, tenantId),
    enabled: !!id && id !== "default-global" && !!tenantId,
  });
}

// ─── Async File Ingest ───────────────────────────────────────────────
export function useIngestFileAsync(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: IngestFileBody) => voiceTechApi.ingestFileAsync(body),
    onSuccess: () => {
      toast.success("File queued for ingestion");
      // Refresh attributes after ingest in case new keys were inferred
      qc.invalidateQueries({ queryKey: ["voice-tech", "attributes", tenantId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "File ingest failed");
    },
  });
}

// ─── Sync Record Ingest ──────────────────────────────────────────────
export function useIngestRecords(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      entityType: string;
      records: Record<string, unknown>[];
    }) =>
      voiceTechApi.ingestRecords({
        tenantId,
        entityType: payload.entityType,
        records: payload.records,
      }),
    onSuccess: () => {
      toast.success("Records ingested successfully");
      qc.invalidateQueries({ queryKey: ["voice-tech", "attributes", tenantId] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Record ingest failed");
    },
  });
}

// ─── Job Status Polling ──────────────────────────────────────────────
/** Statuses that mean the job has finished — stop polling */
const TERMINAL_STATUSES: IngestJobStatus[] = ["completed", "failed"];

export function useJobStatusPolling(jobId: string | null) {
  return useQuery({
    queryKey: VT_KEYS.jobStatus(jobId ?? ""),
    queryFn: () => voiceTechApi.getIngestJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling while queued / processing / retrying
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 2_000;
    },
  });
}

export function useCampaignStatusPolling(jobId: string | null) {
  return useQuery({
    queryKey: ["voice-tech", "campaign-job", jobId ?? ""],
    queryFn: () => voiceTechApi.getBulkJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "failed") return false;
      return 1_500; // Poll slightly faster for interactive wizard
    },
  });
}

// ─── Execute Routing ─────────────────────────────────────────────────
export function useExecuteRouting() {
  return useMutation({
    mutationFn: voiceTechApi.executeRouting,
    onError: (err: Error) => {
      toast.error(err.message || "Routing execution failed");
    },
  });
}

// ─── Query Entities by Rule ──────────────────────────────────────────
import type { RoutingCondition } from "../types";

export function useQueryEntitiesByRule(params: {
  tenantId: string;
  entityType: string;
  conditions: RoutingCondition | null;
  enabled: boolean;
  limit?: number;
  countOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["voice-tech", "entity-matches", params.tenantId, params.entityType, JSON.stringify(params.conditions), params.limit, params.countOnly],
    queryFn: () =>
      voiceTechApi.queryEntitiesByRule({
        tenantId: params.tenantId,
        entityType: params.entityType,
        conditions: params.conditions!,
        limit: params.limit,
        countOnly: params.countOnly,
      }),
    enabled: params.enabled && !!params.tenantId && !!params.entityType && !!params.conditions,
    staleTime: 30_000,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────

/** Create a new routing config mutation */
export function useCreateRoutingConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: voiceTechApi.createRoutingConfig,
    onSuccess: (config, variables) => {
      toast.success(`Config "${variables.name}" created`);
      qc.invalidateQueries({ queryKey: ["voice-tech", "routing", variables.tenantId] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create config");
    },
  });
}

/** Update an existing routing config mutation */
export function useUpdateRoutingConfig(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: voiceTechApi.updateRoutingConfig,
    onSuccess: (config) => {
      toast.success(`Config "${config.name}" updated`);
      qc.invalidateQueries({ queryKey: ["voice-tech", "routing", tenantId] });
      qc.invalidateQueries({ queryKey: VT_KEYS.routingConfig(config.id, tenantId) });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update config");
    },
  });
}

/** Create or Update a routing rule */
export function useUpsertRoutingRule(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: voiceTechApi.upsertRoutingRule,
    onSuccess: () => {
      toast.success("Rule saved successfully");
      // Invalidate the specific config AND the list
      qc.invalidateQueries({ 
        queryKey: ["voice-tech", "routing", tenantId],
        exact: false 
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save rule");
    },
  });
}

/** Delete a routing rule */
export function useDeleteRoutingRule(configId: string, tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ruleId: string) => voiceTechApi.deleteRoutingRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VT_KEYS.routingConfig(configId, tenantId) });
      toast.success("Rule deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete rule");
    },
  });
}

export function useToggleRuleActive(configId: string, tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      ruleId: string;
      tenantId: string;
      entityType: string;
      isActive: boolean;
      triggerCampaign?: boolean;
    }) => voiceTechApi.toggleRuleActive(payload),
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: VT_KEYS.routingConfig(configId, tenantId) });
      if (rule) {
        toast.success(rule.isActive ? "Rule activated" : "Rule deactivated");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Operation failed");
    },
  });
}

/** Delete an entire dataset */
export function useDeleteEntityType(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => voiceTechApi.deleteEntityType(tenantId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-tech", "entity-types", tenantId] });
      toast.success("Dataset deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete dataset");
    },
  });
}

export function useBulkExecuteRouting() {
  return useMutation({
    mutationFn: voiceTechApi.bulkExecuteRouting,
    onSuccess: (result) => {
      toast.success(`Bulk process started with Job ID: ${result.jobId}`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Bulk process failed");
    },
  });
}

export function useCredentials(orgId: string, type?: string) {
  return useQuery({
    queryKey: ["credentials", orgId, type],
    queryFn: () => voiceTechApi.listCredentialsByType(orgId, type),
    enabled: !!orgId,
  });
}

export function useCreateCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIntegrationCredentialInput) => voiceTechApi.createIntegrationCredential(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["credentials", variables.orgId] });
      toast.success("Credential created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create credential");
    }
  });
}

export function useDeleteCredential(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voiceTechApi.deleteCredential(id, orgId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials", orgId] });
      queryClient.invalidateQueries({ queryKey: ["voice-tech", "provider-credentials", orgId], exact: false });
      queryClient.invalidateQueries({ queryKey: ["voice-tech", "credentials-by-type", orgId], exact: false });
      toast.success("Credential deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete credential");
    }
  });
}

/** Delete a routing configuration (stack) */
export function useDeleteRoutingConfig(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (configId: string) => voiceTechApi.deleteRoutingConfig(tenantId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voice-tech", "routing", tenantId] });
      toast.success("Routing stack deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete stack");
    },
  });
}
export function useOrchestrationStats(tenantId: string, configId: string | null) {
  return useQuery({
    queryKey: ["voice-tech", "analytics", "orchestration", tenantId, configId],
    queryFn: () => voiceTechApi.getOrchestrationStats(tenantId, configId!),
    enabled: !!tenantId && !!configId,
    refetchInterval: 10_000, // Refresh every 10s for real-time feel
  });
}

// ─── Voice Agents ───────────────────────────────────────────────────

export function useVoiceAgents(tenantId: string, credentialId?: string) {
  return useQuery({
    queryKey: VT_KEYS.agents(tenantId, credentialId),
    queryFn: () => voiceTechApi.listVoiceAgents({ tenantId, credentialId }),
    enabled: !!tenantId,
  });
}

export function useUpsertVoiceAgent(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: voiceTechApi.upsertVoiceAgent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-tech", "agents", tenantId] });
      toast.success("Agent saved successfully");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save agent");
    },
  });
}

export function useDeleteVoiceAgent(tenantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => voiceTechApi.deleteVoiceAgent(id, tenantId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-tech", "agents", tenantId] });
      toast.success("Agent deleted");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete agent");
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => voiceTechApi.uploadFile(file),
    onError: (err: any) => {
      toast.error(err.message || "File upload failed");
    },
  });
}
