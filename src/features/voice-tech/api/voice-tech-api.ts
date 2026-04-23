import { apiClient } from "@/lib/api-client";
import type {
  CreateIntegrationCredentialInput,
  EntityAttribute,
  IntegrationCredential,
  IngestJob,
  RoutingConfigSummary,
  RoutingConfig,
  Entity,
  IngestFileBody,
  RoutingRule,
  RoutingExecutionResult,
  ToggleRuleActiveResponse,
  RoutingAnalyticsResponse,
} from "../types";

const ENTITIES = "/voice-tech/entities";
const ROUTING  = "/voice-tech/routing";

export const voiceTechApi = {
  // ─── Entity Ingestion ─────────────────────────────────────────────
  /** Sync JSON record ingest */
  ingestRecords: async (
    payload: { tenantId: string; entityType: string; records: Record<string, unknown>[] }
  ): Promise<void> => {
    await apiClient.post(`${ENTITIES}/ingest`, payload);
  },

  /**
   * Sync file ingest — expects { tenantId, entityType, filePath }.
   * File must already be uploaded via the storage flow; pass the returned filePath.
   */
  ingestFile: async (body: IngestFileBody): Promise<void> => {
    await apiClient.post(`${ENTITIES}/ingest-file`, body);
  },

  /** Async JSON record ingest — returns jobId for polling */
  ingestRecordsAsync: async (
    payload: { tenantId: string; entityType: string; records: Record<string, unknown>[] }
  ): Promise<{ jobId: string }> => {
    const { data } = await apiClient.post<{ jobId: string }>(
      `${ENTITIES}/ingest/async`,
      payload
    );
    return data;
  },

  /**
   * Async file ingest (preferred for files) — expects { tenantId, entityType, filePath }.
   * Returns jobId for polling.
   */
  ingestFileAsync: async (body: IngestFileBody): Promise<{ jobId: string }> => {
    const { data } = await apiClient.post<{ jobId: string }>(
      `${ENTITIES}/ingest-file/async`,
      body
    );
    return data;
  },

  /** Poll job status */
  getJobStatus: async (jobId: string): Promise<IngestJob> => {
    const { data } = await apiClient.get<{ success: boolean; status: IngestJob["status"] } & IngestJob>(
      `${ENTITIES}/ingest/jobs/${jobId}`
    );
    return data;
  },

  /** List inferred attributes — requires tenantId and optional entityType */
  listAttributes: async (params: {
    tenantId: string;
    entityType?: string;
  }): Promise<EntityAttribute[]> => {
    const { data } = await apiClient.get<{ success: boolean; attributes: EntityAttribute[] }>(
      `${ENTITIES}/attributes`,
      { params }
    );
    return data.attributes;
  },

  /** List all unique entity types (datasets) for a tenant */
  listEntityTypes: async (tenantId: string): Promise<{id: string, name: string}[]> => {
    const { data } = await apiClient.get<{ success: boolean; types: {id: string, name: string}[] }>(
      `${ENTITIES}/entity-types`,
      { params: { tenantId } }
    );
    return data.types;
  },

  // ─── Routing ──────────────────────────────────────────────────────
  /** List routing configs (summary only — no rules array) */
  listRoutingConfigs: async (tenantId: string): Promise<RoutingConfigSummary[]> => {
    const { data } = await apiClient.get<{ success: boolean; configs: RoutingConfigSummary[] }>(ROUTING, {
      params: { tenantId },
    });
    return data.configs;
  },

  /** Get single routing config WITH active rules */
  getRoutingConfig: async (id: string, tenantId: string): Promise<RoutingConfig> => {
    const { data } = await apiClient.get<{ success: boolean; config: RoutingConfig }>(`${ROUTING}/${id}`, {
      params: { tenantId },
    });
    return data.config;
  },

  /** Create a new routing config */
  createRoutingConfig: async (payload: { 
    tenantId: string; 
    name: string; 
    description?: string;
    entityTypeId?: string;
    type?: string;
  }): Promise<RoutingConfigSummary> => {
    const { data } = await apiClient.post<{ success: boolean; config: RoutingConfigSummary }>(
      ROUTING,
      payload
    );
    return data.config;
  },

  deleteRoutingConfig: async (tenantId: string, id: string): Promise<void> => {
    await apiClient.delete(`${ROUTING}/${id}`, {
      params: { tenantId }
    });
  },

  /** Execute routing — simulate which provider matches given entity data */
  executeRouting: async (payload: {
    tenantId: string;
    routingConfigId: string;
    attributes: Record<string, unknown>;
    userId?: string;
    phone?: string;
    executeProvider?: boolean;
  }): Promise<RoutingExecutionResult> => {
    const { data } = await apiClient.post<{ 
      success: boolean; 
      result: RoutingExecutionResult 
    }>(
      `${ROUTING}/execute`,
      payload
    );
    return data.result;
  },

  /** Query entities that match a rule's conditions */
  queryEntitiesByRule: async (payload: {
    conditions: unknown;
    tenantId: string;
    entityType: string;
    limit?: number;
    countOnly?: boolean;
  }): Promise<{ entities?: Entity[]; count: number }> => {
    const { data } = await apiClient.post<{ success: boolean; entities?: Entity[]; count: number }>(`${ROUTING}/query-entities`, payload);
    return { entities: data.entities, count: data.count };
  },

  /** Upsert a routing rule (create or update) */
  upsertRoutingRule: async (payload: Partial<RoutingRule>): Promise<RoutingRule> => {
    const { data } = await apiClient.post<{ success: boolean; rule: RoutingRule }>(
      `${ROUTING}/rules`,
      payload
    );
    return data.rule;
  },

  /** Toggle rule status and optionally trigger campaign */
  toggleRuleActive: async (payload: {
    ruleId: string;
    tenantId: string;
    entityType: string;
    isActive: boolean;
    triggerCampaign?: boolean;
  }): Promise<RoutingRule> => {
    const { data } = await apiClient.post<{ success: boolean; rule: RoutingRule }>(
      `${ROUTING}/rules/toggle-active`,
      payload
    );
    return data.rule;
  },

  /** Trigger a campaign run for a rule and return campaign stats */
  runRuleCampaign: async (payload: {
    ruleId: string;
    tenantId: string;
    entityType: string;
  }): Promise<ToggleRuleActiveResponse> => {
    const { data } = await apiClient.post<{ success: boolean } & ToggleRuleActiveResponse>(
      `${ROUTING}/rules/toggle-active`,
      {
        ...payload,
        isActive: true,
        triggerCampaign: true,
      }
    );
    return {
      rule: data.rule,
      campaign: data.campaign,
    };
  },

  /** Delete a routing rule */
  deleteRoutingRule: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`${ROUTING}/rules/${ruleId}`);
  },

  /** Delete an entire dataset (EntityType) */
  deleteEntityType: async (tenantId: string, name: string): Promise<void> => {
    await apiClient.delete(`${ENTITIES}/entity-types/${name}`, {
      params: { tenantId }
    });
  },

  listCredentialsByType: async (orgId: string, type: string): Promise<IntegrationCredential[]> => {
    const { data } = await apiClient.get<IntegrationCredential[]>("/integrations/credentials", {
      params: {
        orgId,
        type,
        includeInactive: false,
        includeRevoked: false,
      },
    });
    return data;
  },

  createIntegrationCredential: async (input: CreateIntegrationCredentialInput): Promise<IntegrationCredential> => {
    const { data } = await apiClient.post<IntegrationCredential>('/integrations/credentials', {
      orgId: input.orgId,
      name: input.name,
      type: input.type,
      secret: input.secret,
      metadata: input.metadata,
      isActive: input.isActive ?? true,
    });
    return data;
  },

  /** Execute bulk routing for multiple entity types */
  bulkExecuteRouting: async (payload: {
    tenantId: string;
    routingConfigId: string;
    entityTypes: string[];
  }): Promise<{ totalProcessed: number; initiated: number; failed: number; skipped: number }> => {
    const { data } = await apiClient.post<{ 
      success: boolean; 
      result: { totalProcessed: number; initiated: number; failed: number; skipped: number } 
    }>(
      `${ROUTING}/bulk-execute`,
      payload
    );
    return data.result;
  },

  /** Get orchestration analytics stats */
  getOrchestrationStats: async (tenantId: string, configId: string): Promise<RoutingAnalyticsResponse> => {
    const { data } = await apiClient.get<{ success: boolean; stats: RoutingAnalyticsResponse }>(
      `${ROUTING}/analytics/orchestration`,
      { params: { tenantId, configId } }
    );
    return data.stats;
  },
} as const;
