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
import { MessageCircle, Smartphone, AlertTriangle } from "lucide-react";
import { StepperSidebar, type StepConfig } from "@/features/campaign/presentation/components/wizard/stepper-sidebar";
import { ConditionBuilder } from "./condition-builder";
import { ProviderBadge } from "../shared/provider-badge";
import { useCreateIntegrationCredential, useCredentialsByType, useVoiceProviderCredentials } from "../../../api/voice-tech-queries";
import type { 
  LogicalOperator, 
  RoutingCondition, 
  EntityAttribute, 
  VoiceProvider,
  RoutingRuleAction,
  RoutingRule,
} from "../../../types";
import { TELEPHONY_PROVIDER_TO_CREDENTIAL_TYPE, VOICE_PROVIDERS } from "../../../types";

const STEPS: StepConfig[] = [
  { title: "Define Conditions", description: "Who should this rule apply to?" },
  { title: "Choose Action", description: "Select the voice provider and agent" },
  { title: "Set Priority", description: "Order this rule in the routing stack" },
];

function toConditionGroup(input: RoutingCondition): { operator: LogicalOperator; children: RoutingCondition[] } {
  if ('children' in input) {
    return { operator: input.operator, children: input.children };
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
  const [conditions, setConditions] = useState<{ operator: LogicalOperator; children: RoutingCondition[] }>({
    operator: "AND",
    children: [{ field: "", operator: "equals", value: "" }]
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
  const [voiceCredentialName, setVoiceCredentialName] = useState("");
  const [voiceCredentialApiKey, setVoiceCredentialApiKey] = useState("");
  const [telephonyCredentialName, setTelephonyCredentialName] = useState("");
  const [telephonyCredentialApiKey, setTelephonyCredentialApiKey] = useState("");
  const [exotelAccountSid, setExotelAccountSid] = useState("");
  const [exotelAuthToken, setExotelAuthToken] = useState("");
  const [exotelCallerId, setExotelCallerId] = useState("");
  const [exotelBaseUrl, setExotelBaseUrl] = useState("");
  const [exotelStatusCallbackUrl, setExotelStatusCallbackUrl] = useState("");
  const createCredentialMutation = useCreateIntegrationCredential(tenantId);
  const { data: providerCredentials = [] } = useVoiceProviderCredentials(tenantId, provider);
  const telephonyCredentialType = TELEPHONY_PROVIDER_TO_CREDENTIAL_TYPE[telephonyProvider] ?? 'EXOTEL';
  const { data: telephonyCredentials = [] } = useCredentialsByType(tenantId, telephonyCredentialType);

  // Initialize form when opening or editing changes
  useEffect(() => {
    const apply = () => {
    if (editingRule) {
      setConditions(toConditionGroup(editingRule.conditions));
      setProvider(editingRule.action.voiceProvider as VoiceProvider);
      setVoiceCredentialId(editingRule.action.voiceCredentialId);
      setTelephonyProvider(editingRule.action.telephonyProvider);
      setTelephonyCredentialId(editingRule.action.telephonyCredentialId);
      setAgentId(editingRule.action.agentId);
      setIsActive(editingRule.isActive ?? true);
      setPriority(String(editingRule.priority));
      
      const config = editingRule.action.runtimeConfig as Record<string, unknown>;
      const channel = editingRule.action.channel;
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
      setVoiceCredentialName("");
      setVoiceCredentialApiKey("");
      setTelephonyCredentialName("");
      setTelephonyCredentialApiKey("");
      setExotelAccountSid("");
      setExotelAuthToken("");
      setExotelCallerId("");
      setExotelBaseUrl("");
      setExotelStatusCallbackUrl("");
    } else if (open) {
      // Reset form for NEW rule
      setStep(0);
      setConditions({
        operator: "AND",
        children: [{ field: "", operator: "equals", value: "" }]
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
      setVoiceCredentialName("");
      setVoiceCredentialApiKey("");
      setTelephonyCredentialName("");
      setTelephonyCredentialApiKey("");
      setExotelAccountSid("");
      setExotelAuthToken("");
      setExotelCallerId("");
      setExotelBaseUrl("");
      setExotelStatusCallbackUrl("");
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
      operator: "AND",
      children: [{ field: "", operator: "equals", value: "" }]
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
    setVoiceCredentialName("");
    setVoiceCredentialApiKey("");
    setTelephonyCredentialName("");
    setTelephonyCredentialApiKey("");
    setExotelAccountSid("");
    setExotelAuthToken("");
    setExotelCallerId("");
    setExotelBaseUrl("");
    setExotelStatusCallbackUrl("");
    setPriority(String(nextPriority));
    setIsActive(true);
  }, [nextPriority]);

  const handleCreateVoiceCredential = useCallback(async () => {
    if (!voiceCredentialName.trim() || !voiceCredentialApiKey.trim()) return;

    const created = await createCredentialMutation.mutateAsync({
      orgId: tenantId,
      name: voiceCredentialName.trim(),
      type: provider.toUpperCase(),
      secret: { apiKey: voiceCredentialApiKey.trim() },
      isActive: true,
    });

    setVoiceCredentialId(created.id);
    setVoiceCredentialName("");
    setVoiceCredentialApiKey("");
  }, [createCredentialMutation, provider, tenantId, voiceCredentialApiKey, voiceCredentialName]);

  const handleCreateTelephonyCredential = useCallback(async () => {
    if (!telephonyCredentialName.trim()) return;

    const secret: Record<string, unknown> = {};

    if (telephonyProvider === 'exotel') {
      if (!exotelAccountSid.trim() || !exotelAuthToken.trim() || !exotelCallerId.trim()) return;
      secret['accountSid'] = exotelAccountSid.trim();
      secret['authToken'] = exotelAuthToken.trim();
      secret['callerId'] = exotelCallerId.trim();
      if (exotelBaseUrl.trim()) secret['baseUrl'] = exotelBaseUrl.trim();
      if (exotelStatusCallbackUrl.trim()) secret['statusCallbackUrl'] = exotelStatusCallbackUrl.trim();
    } else {
      if (!telephonyCredentialApiKey.trim()) return;
      secret['apiKey'] = telephonyCredentialApiKey.trim();
    }

    const created = await createCredentialMutation.mutateAsync({
      orgId: tenantId,
      name: telephonyCredentialName.trim(),
      type: telephonyCredentialType,
      secret,
      isActive: true,
    });

    setTelephonyCredentialId(created.id);
    setTelephonyCredentialName("");
    setTelephonyCredentialApiKey("");
    setExotelAccountSid("");
    setExotelAuthToken("");
    setExotelCallerId("");
    setExotelBaseUrl("");
    setExotelStatusCallbackUrl("");
  }, [
    createCredentialMutation,
    exotelAccountSid,
    exotelAuthToken,
    exotelBaseUrl,
    exotelCallerId,
    exotelStatusCallbackUrl,
    telephonyCredentialApiKey,
    telephonyCredentialName,
    telephonyCredentialType,
    telephonyProvider,
    tenantId,
  ]);

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
       // Deep validation of conditions could be added here
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
      id: editingRule?.id, // Important for updates
      priority: priorityNum,
      isActive,
      conditions,
      action,
    });
    
    // Dialog closing is handled by the parent upon success
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[800px] md:max-w-[950px] p-0 gap-0 overflow-hidden h-[92vh] md:h-[650px] max-h-[92vh]">
        <div className="grid grid-cols-[auto_1fr] h-full min-h-0">
          {/* Left: Stepper Sidebar */}
          <StepperSidebar steps={STEPS} currentStep={step} />

          {/* Right: Step Content */}
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
                  {/* STEP 0: CONDITIONS */}
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

                  {/* STEP 1: ACTION */}
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
                                setVoiceCredentialName("");
                                setVoiceCredentialApiKey("");
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
                            <Label>Agent ID / Config ID</Label>
                            <div className="relative">
                               <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                               <Input 
                                  value={agentId} 
                                  onChange={(e) => setAgentId(e.target.value)}
                                  placeholder="e.g. v1-agent-abcd-1234" 
                                  className="pl-9"
                               />
                            </div>
                            <p className="text-[10px] text-muted-foreground">This ID should exist in your chosen provider's dashboard.</p>
                         </div>

                         <div className="space-y-2">
                            <Label>Voice Credential</Label>
                            <Select value={voiceCredentialId} onValueChange={setVoiceCredentialId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select active credential" />
                              </SelectTrigger>
                              <SelectContent>
                                {providerCredentials.map((credential) => (
                                  <SelectItem key={credential.id} value={credential.id}>
                                    {credential.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">Credentials are loaded from Integrations and used securely at runtime.</p>
                            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                              <Label className="text-xs">Create Voice Credential</Label>
                              <Input
                                value={voiceCredentialName}
                                onChange={(e) => setVoiceCredentialName(e.target.value)}
                                placeholder={`e.g. ${provider}-voice-prod`}
                              />
                              <Input
                                value={voiceCredentialApiKey}
                                onChange={(e) => setVoiceCredentialApiKey(e.target.value)}
                                type="password"
                                placeholder="Provider API Key"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                disabled={!voiceCredentialName.trim() || !voiceCredentialApiKey.trim() || createCredentialMutation.isPending}
                                onClick={handleCreateVoiceCredential}
                              >
                                {createCredentialMutation.isPending ? "Creating..." : "Create Voice Credential"}
                              </Button>
                            </div>
                         </div>

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
                                     setTelephonyCredentialName("");
                                     setTelephonyCredentialApiKey("");
                                     setExotelAccountSid("");
                                     setExotelAuthToken("");
                                     setExotelCallerId("");
                                     setExotelBaseUrl("");
                                     setExotelStatusCallbackUrl("");
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

                                 <div className="rounded-lg border bg-background/60 p-3 space-y-2">
                                   <Label className="text-xs">Create Telephony Credential</Label>
                                   <Input
                                     value={telephonyCredentialName}
                                     onChange={(e) => setTelephonyCredentialName(e.target.value)}
                                     placeholder={`e.g. ${telephonyProvider}-telephony-prod`}
                                   />
                                   {telephonyProvider === 'exotel' ? (
                                     <>
                                       <Input
                                         value={exotelAccountSid}
                                         onChange={(e) => setExotelAccountSid(e.target.value)}
                                         placeholder="Exotel Account SID"
                                       />
                                       <Input
                                         type="password"
                                         value={exotelAuthToken}
                                         onChange={(e) => setExotelAuthToken(e.target.value)}
                                         placeholder="Exotel Auth Token"
                                       />
                                       <Input
                                         value={exotelCallerId}
                                         onChange={(e) => setExotelCallerId(e.target.value)}
                                         placeholder="Exotel Caller ID / From"
                                       />
                                       <Input
                                         value={exotelBaseUrl}
                                         onChange={(e) => setExotelBaseUrl(e.target.value)}
                                         placeholder="Base URL (optional)"
                                       />
                                       <Input
                                         value={exotelStatusCallbackUrl}
                                         onChange={(e) => setExotelStatusCallbackUrl(e.target.value)}
                                         placeholder="Status Callback URL (optional)"
                                       />
                                     </>
                                   ) : (
                                     <Input
                                       type="password"
                                       value={telephonyCredentialApiKey}
                                       onChange={(e) => setTelephonyCredentialApiKey(e.target.value)}
                                       placeholder="Telephony API Key"
                                     />
                                   )}
                                   <Button
                                     type="button"
                                     variant="outline"
                                     disabled={
                                       !telephonyCredentialName.trim()
                                       || createCredentialMutation.isPending
                                       || (telephonyProvider === 'exotel'
                                         ? (!exotelAccountSid.trim() || !exotelAuthToken.trim() || !exotelCallerId.trim())
                                         : !telephonyCredentialApiKey.trim())
                                     }
                                     onClick={handleCreateTelephonyCredential}
                                   >
                                     {createCredentialMutation.isPending ? "Creating..." : "Create Telephony Credential"}
                                   </Button>
                                 </div>
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

                  {/* STEP 2: PRIORITY & REVIEW */}
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

            {/* Footer */}
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
