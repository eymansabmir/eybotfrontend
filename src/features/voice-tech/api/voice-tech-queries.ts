import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { voiceTechApi } from "./voice-tech-api";
import { toast } from "sonner";
import type { IngestFileBody, IngestJobStatus } from "../types";

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
};

// ─── Attributes & Categories ─────────────────────────────────────────

export function useVoiceTechAttributes(tenantId: string, entityType?: string) {
  return useQuery({
    queryKey: VT_KEYS.attributes(tenantId, entityType),
    queryFn: async () => {
      const data = await voiceTechApi.listAttributes({ tenantId, entityType });
      return data;
    },
    enabled: !!tenantId,
  });
}

export function useEntityTypes(tenantId: string) {
  return useQuery({
    queryKey: VT_KEYS.entityTypes(tenantId),
    queryFn: () => voiceTechApi.listEntityTypes(tenantId),
    enabled: !!tenantId,
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
    queryFn: () => voiceTechApi.getJobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Keep polling while queued / processing / retrying
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 2_000;
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
}) {
  return useQuery({
    queryKey: ["voice-tech", "entity-matches", params.tenantId, params.entityType, JSON.stringify(params.conditions)],
    queryFn: () =>
      voiceTechApi.queryEntitiesByRule({
        tenantId: params.tenantId,
        entityType: params.entityType,
        conditions: params.conditions!,
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
    onSuccess: (config) => {
      if (config?.name) {
        toast.success(`Config "${config.name}" created`);
      }
      if (config?.tenantId) {
        qc.invalidateQueries({ queryKey: ["voice-tech", "routing", config.tenantId] });
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create config");
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
      queryClient.invalidateQueries({ queryKey: ["voice-tech", "routing", configId, tenantId] });
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
      queryClient.invalidateQueries({ queryKey: ["voice-tech", "routing", configId, tenantId] });
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

/** Bulk execute routing */
export function useBulkExecuteRouting() {
  return useMutation({
    mutationFn: voiceTechApi.bulkExecuteRouting,
    onSuccess: (result) => {
      toast.success(`Bulk process completed: ${result.initiated} calls initiated`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Bulk process failed");
    },
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
