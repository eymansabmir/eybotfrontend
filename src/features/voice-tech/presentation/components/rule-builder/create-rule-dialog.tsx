import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { MessageCircle, Smartphone, AlertTriangle, Bot, CheckCircle2 } from "lucide-react";
import { StepperSidebar, type StepConfig } from "@/features/campaign/presentation/components/wizard/stepper-sidebar";
import { ConditionBuilder } from "./condition-builder";
import { ProviderBadge } from "../shared/provider-badge";
import { useCredentialsByType, useVoiceProviderCredentials, useVoiceAgents } from "../../../api/voice-tech-queries";
import type {
  LogicalOperator,
  RoutingCondition,
  EntityAttribute,
  VoiceProvider,
  RoutingRuleAction,
  RoutingRule,
} from "../../../types";
import { TELEPHONY_PROVIDER_TO_CREDENTIAL_TYPE, VOICE_PROVIDERS } from "../../../types";

const generateId = () => Math.random().toString(36).substring(2, 11);

const STEPS: StepConfig[] = [
  { title: "Define Conditions", description: "Who should this rule apply to?" },
  { title: "Choose Action", description: "Select the voice provider and agent" },
  { title: "Set Priority", description: "Order this rule in the routing stack" },
];

function toConditionGroup(input: RoutingCondition): { operator: LogicalOperator; children: RoutingCondition[] } {
  if (!input || Object.keys(input).length === 0) {
    return { operator: 'AND', children: [{ id: generateId(), field: "", operator: "equals", value: "" }] };
  }
  if ('children' in input) {
    return { operator: input.operator as LogicalOperator, children: input.children };
  }
  return { operator: 'AND', children: [input] };
}

function readString(config: Record<string, unknown>, key: string, fallback = ""): string {
  const value = config[key];
  return typeof value === 'string' ? value : fallback;
}

interface CreateRoutingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  attributes: EntityAttribute[] | Record<string, EntityAttribute[]>;
  onSave: (rule: {
    id?: string;
    priority: number;
    isActive: boolean;
    conditions: { operator: LogicalOperator; children: RoutingCondition[] };
    action: RoutingRuleAction;
  }) => void;
  isSaving?: boolean;
  editingRule?: RoutingRule | null; // The rule being edited, if any
  nextPriority?: number; // Suggested next priority (max + 1)
  existingPriorities?: number[]; // All priorities in the current config
}

export function CreateRoutingRuleDialog({
  open,
  onOpenChange,
  tenantId,
  attributes,
  onSave,
  isSaving = false,
  editingRule,
  nextPriority = 1,
  existingPriorities = []
}: CreateRoutingRuleDialogProps) {
  const [step, setStep] = useState(0);
  const prevIsSaving = useRef(isSaving);

  // ── Form State ──────────────────────────────────────────────────
  const [conditions, setConditions] = useState<{ id?: string; operator: LogicalOperator; children: RoutingCondition[] }>({
    id: generateId(),
    operator: "AND",
    children: [{ id: generateId(), field: "", operator: "equals", value: "" }]
  });

  const [provider, setProvider] = useState<VoiceProvider>("elevenlabs");
  const [voiceCredentialId, setVoiceCredentialId] = useState("");
  const [telephonyProvider, setTelephonyProvider] = useState("exotel");
  const [telephonyCredentialId, setTelephonyCredentialId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [transport, setTransport] = useState<"telephony" | "whatsapp">("telephony");
  const [agentPhoneNumberId, setAgentPhoneNumberId] = useState("");
  const [whatsappPhoneNumberId, setWhatsappPhoneNumberId] = useState("");
  const [whatsappTemplateName, setWhatsappTemplateName] = useState("");
  const [whatsappTemplateLanguageCode, setWhatsappTemplateLanguageCode] = useState("en_US");
  const [defaultWhatsappUserId, setDefaultWhatsappUserId] = useState("");
  const [sarvamOrchestratorBaseUrl, setSarvamOrchestratorBaseUrl] = useState("");
  const [sarvamTelephonyEndpoint, setSarvamTelephonyEndpoint] = useState("");
  const [sarvamWhatsappEndpoint, setSarvamWhatsappEndpoint] = useState("");
  const [sarvamBatchEndpoint, setSarvamBatchEndpoint] = useState("");
  const [vapiPhoneNumberId, setVapiPhoneNumberId] = useState("");
  const [vapiBaseUrl, setVapiBaseUrl] = useState("");
  const [vapiTelephonyEndpoint, setVapiTelephonyEndpoint] = useState("");
  const [vapiWhatsappEndpoint, setVapiWhatsappEndpoint] = useState("");
  const [vapiBatchIntervalMs, setVapiBatchIntervalMs] = useState("250");
  const [priority, setPriority] = useState(String(nextPriority));
  const [isActive, setIsActive] = useState(true);

  const { data: providerCredentials = [] } = useVoiceProviderCredentials(tenantId, provider);
  const telephonyCredentialType = TELEPHONY_PROVIDER_TO_CREDENTIAL_TYPE[telephonyProvider] ?? 'EXOTEL';
  const { data: telephonyCredentials = [] } = useCredentialsByType(tenantId, telephonyCredentialType);
  const { data: allAgents = [] } = useVoiceAgents(tenantId);
  
  // Filter agents by the selected provider (e.g., ElevenLabs)
  const agents = allAgents.filter(a => a.credential?.type === provider.toUpperCase());

  // Initialize form when opening or editing changes
  useEffect(() => {
    const apply = () => {
      if (editingRule) {
        setStep(0);
        
        // Safely parse conditions
        let parsedConditions = editingRule.conditions;
        if (typeof parsedConditions === 'string') {
          try { parsedConditions = JSON.parse(parsedConditions); } catch (e) { parsedConditions = null as any; }
        }
        if (!parsedConditions || Object.keys(parsedConditions).length === 0) {
          setConditions({ operator: 'AND', children: [{ id: generateId(), field: "", operator: "equals", value: "" }] });
        } else {
          setConditions(toConditionGroup(parsedConditions));
        }

        // Safely parse action
        let action = editingRule.action;
        if (typeof action === 'string') {
          try { action = JSON.parse(action); } catch (e) { action = {} as any; }
        }
        action = action || ({} as any);
        
        setProvider((action.voiceProvider as VoiceProvider) || "elevenlabs");
        setVoiceCredentialId(action.voiceCredentialId || "");
        setTelephonyProvider(action.telephonyProvider || "exotel");
        setTelephonyCredentialId(action.telephonyCredentialId || "");
        setAgentId(action.agentId || "");
        setIsActive(editingRule.isActive ?? true);
        setPriority(String(editingRule.priority));

        // Safely parse runtimeConfig
        let config = action.runtimeConfig || {};
        if (typeof config === 'string') {
          try { config = JSON.parse(config); } catch (e) { config = {}; }
        }
        
        const channel = action.channel || "telephony";
        setTransport(channel === "whatsapp" ? "whatsapp" : "telephony");
        setAgentPhoneNumberId(readString(config, 'agentPhoneNumberId'));
        setWhatsappPhoneNumberId(readString(config, 'whatsappPhoneNumberId'));
        setWhatsappTemplateName(readString(config, 'whatsappCallPermissionRequestTemplateName'));
        setWhatsappTemplateLanguageCode(readString(config, 'whatsappCallPermissionRequestTemplateLanguageCode', 'en_US'));
        setDefaultWhatsappUserId(readString(config, 'whatsappUserId'));
        setSarvamOrchestratorBaseUrl(readString(config, 'orchestratorBaseUrl'));
        setSarvamTelephonyEndpoint(readString(config, 'telephonyEndpoint'));
        setSarvamWhatsappEndpoint(readString(config, 'whatsappEndpoint'));
        setSarvamBatchEndpoint(readString(config, 'batchEndpoint'));
        setVapiPhoneNumberId(readString(config, 'phoneNumberId'));
        setVapiBaseUrl(readString(config, 'baseUrl'));
        setVapiTelephonyEndpoint(readString(config, 'telephonyEndpoint'));
        setVapiWhatsappEndpoint(readString(config, 'whatsappEndpoint'));
        setVapiBatchIntervalMs(typeof config['batchIntervalMs'] === 'number' ? String(config['batchIntervalMs']) : "250");

      } else if (open) {
        // Reset form for NEW rule
        setStep(0);
        setConditions({
          id: generateId(),
          operator: "AND",
          children: [{ id: generateId(), field: "", operator: "equals", value: "" }]
        });
        setProvider("elevenlabs");
        setVoiceCredentialId("");
        setTelephonyProvider("exotel");
        setTelephonyCredentialId("");
        setAgentId("");
        setTransport("telephony");
        setAgentPhoneNumberId("");
        setWhatsappPhoneNumberId("");
        setWhatsappTemplateName("");
        setWhatsappTemplateLanguageCode("en_US");
        setDefaultWhatsappUserId("");
        setSarvamOrchestratorBaseUrl("");
        setSarvamTelephonyEndpoint("");
        setSarvamWhatsappEndpoint("");
        setSarvamBatchEndpoint("");
        setVapiPhoneNumberId("");
        setVapiBaseUrl("");
        setVapiTelephonyEndpoint("");
        setVapiWhatsappEndpoint("");
        setVapiBatchIntervalMs("250");

        setPriority(String(nextPriority));
        setIsActive(true);
      }
    };

    queueMicrotask(apply);
  }, [editingRule, nextPriority, open]);

  const isElevenLabs = provider === "elevenlabs";
  const isSarvam = provider === "sarvam";
  const isVapi = provider === "vapi";
  const usesTransportConfig = isElevenLabs || isSarvam || isVapi;

  const resetForm = useCallback(() => {
    setStep(0);
    setConditions({
      id: generateId(),
      operator: "AND",
      children: [{ id: generateId(), field: "", operator: "equals", value: "" }]
    });
    setProvider("elevenlabs");
    setVoiceCredentialId("");
    setTelephonyProvider("exotel");
    setTelephonyCredentialId("");
    setAgentId("");
    setTransport("telephony");
    setAgentPhoneNumberId("");
    setWhatsappPhoneNumberId("");
    setWhatsappTemplateName("");
    setWhatsappTemplateLanguageCode("en_US");
    setDefaultWhatsappUserId("");
    setSarvamOrchestratorBaseUrl("");
    setSarvamTelephonyEndpoint("");
    setSarvamWhatsappEndpoint("");
    setSarvamBatchEndpoint("");
    setVapiPhoneNumberId("");
    setVapiBaseUrl("");
    setVapiTelephonyEndpoint("");
    setVapiWhatsappEndpoint("");
    setVapiBatchIntervalMs("250");

    setPriority(String(nextPriority));
    setIsActive(true);
  }, [nextPriority]);



  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(resetForm, 200);
  }, [onOpenChange, resetForm]);

  // Auto-close dialog when save is successful
  useEffect(() => {
    if (prevIsSaving.current === true && isSaving === false && open) {
      handleClose();
    }
    prevIsSaving.current = isSaving;
  }, [isSaving, open, handleClose]);

  const priorityNum = parseInt(priority, 10);
  const isPriorityCollision = !editingRule
    ? existingPriorities.includes(priorityNum)
    : priorityNum !== editingRule.priority && existingPriorities.includes(priorityNum);

  const isPriorityJump = !editingRule && priorityNum > nextPriority;

  const canContinue = (() => {
    if (step === 0) {
      return conditions.children.length > 0;
    }
    if (step === 1) {
      if (agentId.trim().length === 0) return false;
      if (voiceCredentialId.trim().length === 0) return false;
      if (telephonyCredentialId.trim().length === 0) return false;
      if (!usesTransportConfig) return true;

      if (isSarvam) return true;
      if (isVapi) return vapiPhoneNumberId.trim().length > 0;

      if (transport === "telephony") {
        return agentPhoneNumberId.trim().length > 0;
      }

      return (
        whatsappPhoneNumberId.trim().length > 0 &&
        whatsappTemplateName.trim().length > 0 &&
        whatsappTemplateLanguageCode.trim().length > 0
      );
    }
    if (step === 2) {
      return (
        priority.trim().length > 0 &&
        !isNaN(priorityNum) &&
        priorityNum >= 1 &&
        !isPriorityCollision &&
        !isPriorityJump
      );
    }
    return false;
  })();

  const handleSave = () => {
    const config: Record<string, unknown> = {};

    if (usesTransportConfig) {
      config.transport = transport;
    }

    if (isElevenLabs) {
      if (transport === "telephony") {
        config.agentPhoneNumberId = agentPhoneNumberId.trim();
      } else {
        config.whatsappPhoneNumberId = whatsappPhoneNumberId.trim();
        config.whatsappCallPermissionRequestTemplateName = whatsappTemplateName.trim();
        config.whatsappCallPermissionRequestTemplateLanguageCode = whatsappTemplateLanguageCode.trim();
        if (defaultWhatsappUserId.trim().length > 0) {
          config.whatsappUserId = defaultWhatsappUserId.trim();
        }
      }
    }

    if (isSarvam) {
      if (sarvamOrchestratorBaseUrl.trim().length > 0) {
        config.orchestratorBaseUrl = sarvamOrchestratorBaseUrl.trim();
      }
      if (sarvamTelephonyEndpoint.trim().length > 0) {
        config.telephonyEndpoint = sarvamTelephonyEndpoint.trim();
      }
      if (sarvamWhatsappEndpoint.trim().length > 0) {
        config.whatsappEndpoint = sarvamWhatsappEndpoint.trim();
      }
      if (sarvamBatchEndpoint.trim().length > 0) {
        config.batchEndpoint = sarvamBatchEndpoint.trim();
      }
      if (defaultWhatsappUserId.trim().length > 0) {
        config.whatsappUserId = defaultWhatsappUserId.trim();
      }
    }

    if (isVapi) {
      config.phoneNumberId = vapiPhoneNumberId.trim();
      if (vapiBaseUrl.trim().length > 0) {
        config.baseUrl = vapiBaseUrl.trim();
      }
      if (vapiTelephonyEndpoint.trim().length > 0) {
        config.telephonyEndpoint = vapiTelephonyEndpoint.trim();
      }
      if (vapiWhatsappEndpoint.trim().length > 0) {
        config.whatsappEndpoint = vapiWhatsappEndpoint.trim();
      }
      if (vapiBatchIntervalMs.trim().length > 0) {
        const parsed = Number(vapiBatchIntervalMs);
        if (!Number.isNaN(parsed) && parsed >= 0) {
          config.batchIntervalMs = parsed;
        }
      }
      if (defaultWhatsappUserId.trim().length > 0) {
        config.whatsappUserId = defaultWhatsappUserId.trim();
      }
    }

    const action: RoutingRuleAction = {
      type: "VOICE_PROVIDER",
      voiceProvider: provider,
      voiceCredentialId,
      telephonyProvider,
      telephonyCredentialId,
      channel: transport,
      agentId,
      runtimeConfig: config,
    };

    onSave({
      id: editingRule?.id,
      priority: priorityNum,
      isActive,
      conditions,
      action,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] md:max-w-[950px] p-0 gap-0 overflow-hidden h-[92vh] md:h-[650px] max-h-[92vh]">
        <div className="grid grid-cols-[auto_1fr] h-full min-h-0">
          <StepperSidebar steps={STEPS} currentStep={step} />

          <div className="flex flex-col h-full min-h-0 bg-background overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto vt-scrollbar p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {step === 0 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Match Conditions</h3>
                        <p className="text-sm text-muted-foreground">Define logic to route users to a specific voice agent.</p>
                      </div>
                      <ConditionBuilder
                        value={conditions}
                        attributes={attributes}
                        onChange={setConditions}
                      />
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">Configure Action</h3>
                        <p className="text-sm text-muted-foreground">Select where the call should be routed if conditions match.</p>
                      </div>

                      <div className="space-y-4 max-w-sm">
                        <div className="space-y-2">
                          <Label>Voice Provider</Label>
                          <Select
                            value={provider}
                            onValueChange={(v) => {
                              setProvider(v as VoiceProvider);
                              setVoiceCredentialId("");
                              setAgentId("");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VOICE_PROVIDERS.map(p => (
                                <SelectItem key={p} value={p}>
                                  <div className="flex items-center gap-2">
                                    <ProviderBadge provider={p} />
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Voice Agent</Label>
                          <Select 
                            value={agentId} 
                            onValueChange={(val) => {
                              setAgentId(val);
                              const selectedAgent = agents.find(a => a.config.agentId === val);
                              if (selectedAgent) {
                                setVoiceCredentialId(selectedAgent.credentialId);
                              }
                            }}
                          >
                            <SelectTrigger className="pl-9 relative">
                              <Bot className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                              <SelectValue placeholder="Select configured agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {agents.length === 0 ? (
                                <div className="p-4 text-center">
                                  <p className="text-xs text-muted-foreground">No agents found for {provider}.</p>
                                  <Button 
                                    variant="link" 
                                    className="h-auto p-0 text-[10px]" 
                                    onClick={() => window.open('/voice-tech/vendors', '_blank')}
                                  >
                                    Add Agent first
                                  </Button>
                                </div>
                              ) : (
                                agents.map((agent) => (
                                  <SelectItem key={agent.id} value={agent.config.agentId}>
                                    {agent.providerName} ({agent.config.agentId})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-muted-foreground">Select from agents configured on the <Button variant="link" className="h-auto p-0 text-[10px]" onClick={() => window.open('/voice-tech/vendors', '_blank')}>Vendors Page</Button>.</p>
                        </div>

                        {agentId && voiceCredentialId && (
                           <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                             <CheckCircle2 className="size-3.5 text-emerald-600" />
                             <p className="text-[10px] text-emerald-700 font-medium">
                               Using Credential: <span className="font-bold">{agents.find(a => a.config.agentId === agentId)?.credential?.name}</span>
                             </p>
                           </div>
                        )}

                        {usesTransportConfig && (
                          <>
                            <div className="space-y-2 rounded-xl border bg-muted/20 p-3">
                              <Label>Call Channel</Label>
                              <Select value={transport} onValueChange={(v) => setTransport(v as "telephony" | "whatsapp")}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="telephony">Telephony Voice Call</SelectItem>
                                  <SelectItem value="whatsapp">WhatsApp Voice Call</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-[10px] text-muted-foreground">
                                Choose how {isElevenLabs ? "ElevenLabs" : isSarvam ? "Sarvam" : "Vapi"} should place calls for this rule.
                              </p>

                              <div className="grid gap-2 pt-1">
                                <Label>Telephony Provider</Label>
                                <Select
                                  value={telephonyProvider}
                                  onValueChange={(value) => {
                                    setTelephonyProvider(value);
                                    setTelephonyCredentialId("");
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="exotel">Exotel</SelectItem>
                                    <SelectItem value="sarvam">Sarvam</SelectItem>
                                    <SelectItem value="vapi">Vapi</SelectItem>
                                    <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Label>Telephony Credential</Label>
                                <Select value={telephonyCredentialId} onValueChange={setTelephonyCredentialId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select telephony credential" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {telephonyCredentials.map((credential) => (
                                      <SelectItem key={credential.id} value={credential.id}>
                                        {credential.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  Manage telephony credentials on the <Button variant="link" className="h-auto p-0 text-[10px]" onClick={() => window.open('/voice-tech/vendors', '_blank')}>Vendors Page</Button>.
                                </p>
                              </div>
                            </div>

                            {isElevenLabs && transport === "telephony" ? (
                              <div className="space-y-2">
                                <Label>Agent Phone Number ID</Label>
                                <Input
                                  value={agentPhoneNumberId}
                                  onChange={(e) => setAgentPhoneNumberId(e.target.value)}
                                  placeholder="e.g. pn_abc123"
                                />
                                <p className="text-[10px] text-muted-foreground">Required for ElevenLabs telephony endpoint.</p>
                              </div>
                            ) : isElevenLabs && transport === "whatsapp" ? (
                              <div className="space-y-3 rounded-xl border vt-whatsapp-panel p-3">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="size-4" />
                                  <p className="text-xs font-bold uppercase tracking-wide vt-whatsapp-chip px-1.5 py-0.5 rounded-sm">WhatsApp Voice Setup</p>
                                </div>

                                <div className="space-y-2">
                                  <Label>WhatsApp Phone Number ID</Label>
                                  <Input
                                    value={whatsappPhoneNumberId}
                                    onChange={(e) => setWhatsappPhoneNumberId(e.target.value)}
                                    placeholder="e.g. wpn_abc123"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Permission Template Name</Label>
                                  <Input
                                    value={whatsappTemplateName}
                                    onChange={(e) => setWhatsappTemplateName(e.target.value)}
                                    placeholder="e.g. call_permission_template"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Template Language Code</Label>
                                  <Input
                                    value={whatsappTemplateLanguageCode}
                                    onChange={(e) => setWhatsappTemplateLanguageCode(e.target.value)}
                                    placeholder="e.g. en_US"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Default WhatsApp User ID (Optional)</Label>
                                  <Input
                                    value={defaultWhatsappUserId}
                                    onChange={(e) => setDefaultWhatsappUserId(e.target.value)}
                                    placeholder="e.g. 15551234567"
                                  />
                                  <p className="text-[10px] text-muted-foreground">
                                    If left empty, you can provide user ID while triggering a specific call.
                                  </p>
                                </div>
                              </div>
                            ) : isSarvam ? (
                              <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="size-4" />
                                  <p className="text-xs font-bold uppercase tracking-wide">Sarvam Orchestrator Settings</p>
                                </div>

                                <div className="space-y-2">
                                  <Label>Orchestrator Base URL (Optional)</Label>
                                  <Input
                                    value={sarvamOrchestratorBaseUrl}
                                    onChange={(e) => setSarvamOrchestratorBaseUrl(e.target.value)}
                                    placeholder="https://your-orchestrator.example.com"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Telephony Endpoint (Optional)</Label>
                                  <Input
                                    value={sarvamTelephonyEndpoint}
                                    onChange={(e) => setSarvamTelephonyEndpoint(e.target.value)}
                                    placeholder="/v1/voice/telephony/outbound-call"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>WhatsApp Endpoint (Optional)</Label>
                                  <Input
                                    value={sarvamWhatsappEndpoint}
                                    onChange={(e) => setSarvamWhatsappEndpoint(e.target.value)}
                                    placeholder="/v1/voice/whatsapp/outbound-call"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Batch Endpoint (Optional)</Label>
                                  <Input
                                    value={sarvamBatchEndpoint}
                                    onChange={(e) => setSarvamBatchEndpoint(e.target.value)}
                                    placeholder="/v1/voice/batch-calling/submit"
                                  />
                                </div>

                                {transport === "whatsapp" && (
                                  <div className="space-y-2">
                                    <Label>Default WhatsApp User ID (Optional)</Label>
                                    <Input
                                      value={defaultWhatsappUserId}
                                      onChange={(e) => setDefaultWhatsappUserId(e.target.value)}
                                      placeholder="e.g. 15551234567"
                                    />
                                  </div>
                                )}

                                <p className="text-[10px] text-muted-foreground">
                                  Sarvam adapter follows LiveKit best practices internally (STT turn detection, flush signal, low endpointing delay).
                                </p>
                              </div>
                            ) : isVapi ? (
                              <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="size-4" />
                                  <p className="text-xs font-bold uppercase tracking-wide">Vapi Call Settings</p>
                                </div>

                                <div className="space-y-2">
                                  <Label>Phone Number ID</Label>
                                  <Input
                                    value={vapiPhoneNumberId}
                                    onChange={(e) => setVapiPhoneNumberId(e.target.value)}
                                    placeholder="e.g. pn_abc123"
                                  />
                                  <p className="text-[10px] text-muted-foreground">
                                    Required Vapi number used to place outbound calls.
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label>API Base URL (Optional)</Label>
                                  <Input
                                    value={vapiBaseUrl}
                                    onChange={(e) => setVapiBaseUrl(e.target.value)}
                                    placeholder="https://api.vapi.ai"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Telephony Endpoint (Optional)</Label>
                                  <Input
                                    value={vapiTelephonyEndpoint}
                                    onChange={(e) => setVapiTelephonyEndpoint(e.target.value)}
                                    placeholder="/call"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>WhatsApp Endpoint (Optional)</Label>
                                  <Input
                                    value={vapiWhatsappEndpoint}
                                    onChange={(e) => setVapiWhatsappEndpoint(e.target.value)}
                                    placeholder="/call"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label>Batch Interval (ms)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={vapiBatchIntervalMs}
                                    onChange={(e) => setVapiBatchIntervalMs(e.target.value)}
                                    placeholder="250"
                                  />
                                </div>

                                {transport === "whatsapp" && (
                                  <div className="space-y-2">
                                    <Label>Default WhatsApp User/Number (Optional)</Label>
                                    <Input
                                      value={defaultWhatsappUserId}
                                      onChange={(e) => setDefaultWhatsappUserId(e.target.value)}
                                      placeholder="e.g. +15551234567"
                                    />
                                  </div>
                                )}

                                <p className="text-[10px] text-muted-foreground">
                                  Vapi calls use assistantId from Agent ID and send rule attributes via assistantOverrides.variableValues.
                                </p>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold">Priority & Status</h3>
                        <p className="text-sm text-muted-foreground">Rules are evaluated sequentially. Lower numbers have higher precedence.</p>
                      </div>

                      <div className="space-y-4 max-w-sm">
                        <div className="space-y-2">
                          <Label>Rule Priority</Label>
                          <Input
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            min="1"
                            className={isPriorityCollision || isPriorityJump ? "border-rose-500 focus-visible:ring-rose-500 shadow-sm shadow-rose-500/10" : ""}
                          />
                          {isPriorityCollision && (
                            <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight flex items-center gap-1.5 mt-2 transition-all">
                              <AlertTriangle className="size-3" />
                              Priority {priorityNum} is already taken in this stack
                            </p>
                          )}
                          {isPriorityJump && (
                            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight flex items-center gap-1.5 mt-2 transition-all">
                              <AlertTriangle className="size-3" />
                              Sequence Error: Next available priority is {nextPriority}.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/20">
                          <div className="flex-1">
                            <p className="text-sm font-semibold">Enable Rule</p>
                            <p className="text-xs text-muted-foreground">Immediately activate this routing logic after saving.</p>
                          </div>
                          <Button
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsActive(!isActive)}
                          >
                            {isActive ? "ACTIVE" : "DISABLED"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t border-border px-8 py-4 flex items-center justify-between bg-muted/20 shrink-0 sticky bottom-0">
              <p className="text-xs text-muted-foreground italic">
                Step {step + 1} of {STEPS.length}
              </p>
              <div className="flex items-center gap-2">
                {step === 0 ? (
                  <Button variant="outline" onClick={handleClose}>Cancel</Button>
                ) : (
                  <Button variant="outline" onClick={() => setStep((s) => s - 1)}>Back</Button>
                )}

                {step < STEPS.length - 1 ? (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canContinue}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={!canContinue || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Routing Rule"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
