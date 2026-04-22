// ─── Attribute Types ────────────────────────────────────────────────
export type AttributeType = 'string' | 'number' | 'boolean' | 'enum' | 'date';

/** Mirrors entity.repository.ts response — no `id` field */
export interface EntityAttribute {
  key: string;
  type: AttributeType;
  operators: string[];
  values: string[] | null; // only populated for enum type
}

/** Operator sets per attribute type — mirrors backend voice-tech.schemas.ts */
export const OPERATORS_BY_TYPE: Record<AttributeType, string[]> = {
  number: ['<', '>', '<=', '>=', 'equals', 'not_equals'],
  date:   ['<', '>', '<=', '>=', 'equals', 'not_equals'],
  string: ['equals', 'not_equals', 'contains', 'in', 'not_in'],
  enum:   ['equals', 'not_equals', 'in', 'not_in'],
  boolean:['equals', 'not_equals'],
};

export const OPERATOR_LABELS: Record<string, string> = {
  '<':           'less than',
  '>':           'greater than',
  '<=':          'at most',
  '>=':          'at least',
  equals:        'equals',
  not_equals:    'not equals',
  contains:      'contains',
  in:            'is one of',
  not_in:        'is not one of',
};

// ─── Recursive Condition Tree ───────────────────────────────────────
export type LogicalOperator = 'AND' | 'OR';

export interface ConditionLeaf {
  id?: string;
  field: string;
  operator: string;
  value: unknown;
}

export type RoutingCondition =
  | ConditionLeaf
  | { id?: string; operator: LogicalOperator; children: RoutingCondition[] };

export function isConditionLeaf(c: RoutingCondition): c is ConditionLeaf {
  return 'field' in c;
}

// ─── Routing Action — strict shape from rule.types.ts ───────────────
export interface RoutingRuleAction {
  type: 'VOICE_PROVIDER'; // literal required by backend
  telephonyProvider: string;
  voiceProvider: string;
  telephonyCredentialId: string;
  voiceCredentialId: string;
  channel: 'telephony' | 'whatsapp';
  agentId: string;         // required
  runtimeConfig: Record<string, unknown>;
}

export interface RoutingRule {
  id: string;
  routingConfigId: string;
  priority: number;
  isActive: boolean;
  conditions: RoutingCondition;
  action: RoutingRuleAction;
  createdAt: string;
  updatedAt: string;
}

export interface VoiceProviderExecutionResult {
  accepted: boolean;
  providerReference?: string;
  message?: string;
}

export type VoiceCredentialType = 'ELEVENLABS' | 'SARVAM' | 'VAPI';
export type TelephonyCredentialType = 'EXOTEL' | 'SARVAM' | 'VAPI' | 'ELEVENLABS';

export interface IntegrationCredential {
  id: string;
  orgId: string;
  name: string;
  type: string;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
  lastTestedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIntegrationCredentialInput {
  orgId: string;
  name: string;
  type: string;
  secret: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

export interface RoutingExecutionResult {
  matchedRuleId: string | null;
  action: RoutingRuleAction;
  providerResult?: VoiceProviderExecutionResult;
}

export interface VoiceCampaignResult {
  total: number;
  initiated: number;
  failed: number;
  details: Array<{
    entityId: string;
    phone?: string;
    success: boolean;
    ref?: string;
    error?: string;
  }>;
}

export interface ToggleRuleActiveResponse {
  rule: RoutingRule;
  campaign?: VoiceCampaignResult | null;
}

/** GET /routing list — no rules array (summary only) */
export interface RoutingConfigSummary {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /routing/:id — full config with active rules */
export interface RoutingConfig extends RoutingConfigSummary {
  rules: RoutingRule[];
}

// ─── Ingest Job ─────────────────────────────────────────────────────
/** Statuses from voice-ingest.consumer.ts — includes 'retrying' */
export type IngestJobStatus = 'queued' | 'processing' | 'retrying' | 'completed' | 'failed';

/** Fields other than jobId and status are NOT guaranteed by backend */
export interface IngestJob {
  jobId: string;
  status: IngestJobStatus;
  processed?: number;
  total?: number;
  errors?: string[];
}

// ─── Ingest File Body ───────────────────────────────────────────────
/** ingest-file endpoint expects body params, NOT multipart */
export interface IngestFileBody {
  tenantId: string;
  entityType: string;
  filePath: string; // path returned from storage upload flow
}

// ─── Entity ─────────────────────────────────────────────────────────
export interface Entity {
  id: string;
  tenantId: string;
  entityTypeId: string;
  attributes: Record<string, unknown>;
  createdAt: string;
}

// ─── Providers ──────────────────────────────────────────────────────
export const VOICE_PROVIDERS = ['elevenlabs', 'sarvam', 'vapi'] as const;
export type VoiceProvider = (typeof VOICE_PROVIDERS)[number];

export const PROVIDER_TO_CREDENTIAL_TYPE: Record<VoiceProvider, VoiceCredentialType> = {
  elevenlabs: 'ELEVENLABS',
  sarvam: 'SARVAM',
  vapi: 'VAPI',
};

export const TELEPHONY_PROVIDER_TO_CREDENTIAL_TYPE: Record<string, TelephonyCredentialType> = {
  exotel: 'EXOTEL',
  sarvam: 'SARVAM',
  vapi: 'VAPI',
  elevenlabs: 'ELEVENLABS',
};

export const PROVIDER_META: Record<VoiceProvider, { label: string; color: string }> = {
  elevenlabs: { label: 'ElevenLabs', color: '#8B5CF6' },
  sarvam:     { label: 'Sarvam',     color: '#F59E0B' },
  vapi:       { label: 'Vapi',       color: '#06B6D4' },
};
