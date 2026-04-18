import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Layers3,
  Loader2,
  MessageCircle,
  Phone,
  Rocket,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useExecuteRouting, useQueryEntitiesByRule } from "../../../api/voice-tech-queries";
import { voiceTechApi } from "../../../api/voice-tech-api";
import { ProviderBadge } from "../shared/provider-badge";
import type { RoutingCondition, RoutingRule } from "../../../types";

interface RuleCallLaunchpadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  entityType: string;
  configId: string | null;
  rule: RoutingRule | null;
  initialMode?: "single" | "bulk";
}

function collectLeafValues(node: RoutingCondition, output: Record<string, unknown>) {
  if ("field" in node) {
    output[node.field] = node.value;
    return;
  }
  node.children.forEach((child) => collectLeafValues(child, output));
}

function safeJsonParse(value: string): Record<string, unknown> {
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Payload must be a JSON object");
  }
  return parsed as Record<string, unknown>;
}

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

function readConfigValue(config: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = config?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function getMissingConfigLabels(rule: RoutingRule, _mode: "single" | "bulk"): string[] {
  const config = rule.action.config;
  const transport = config?.transport === "whatsapp" ? "whatsapp" : "telephony";

  if (rule.action.provider === "elevenlabs") {
    if (transport === "telephony") {
      return readConfigValue(config, "agentPhoneNumberId") ? [] : ["Agent Phone Number ID"];
    }

    const missing: string[] = [];
    if (!readConfigValue(config, "whatsappPhoneNumberId")) missing.push("WhatsApp Phone Number ID");
    if (!readConfigValue(config, "whatsappCallPermissionRequestTemplateName")) missing.push("Permission Template Name");
    if (!readConfigValue(config, "whatsappCallPermissionRequestTemplateLanguageCode")) missing.push("Template Language Code");
    return missing;
  }

  if (rule.action.provider === "sarvam") {
    const missing: string[] = [];
    const hasBaseUrl = Boolean(readConfigValue(config, "orchestratorBaseUrl"));
    const hasEnvFallback = false;

    if (!hasBaseUrl && !hasEnvFallback) {
      missing.push("Sarvam Orchestrator Base URL (or backend env SARVAM_VOICE_ORCHESTRATOR_URL)");
    }

    return missing;
  }

  if (rule.action.provider === "vapi") {
    const missing: string[] = [];
    if (!readConfigValue(config, "phoneNumberId")) {
      missing.push("Vapi Phone Number ID");
    }

    return missing;
  }

  return [];
}

interface SetupCheck {
  label: string;
  ok: boolean;
  helper?: string;
}

interface ConfigSummaryItem {
  label: string;
  value: string;
}

function buildConfigSummary(rule: RoutingRule | null): ConfigSummaryItem[] {
  if (!rule) return [];

  const config = rule.action.config;
  const transport = config?.transport === "whatsapp" ? "whatsapp" : "telephony";
  const summary: ConfigSummaryItem[] = [
    { label: "Provider", value: rule.action.provider },
    { label: "Agent ID", value: rule.action.agentId || "-" },
    { label: "Transport", value: transport === "whatsapp" ? "WhatsApp" : "Telephony" },
  ];

  if (rule.action.provider === "elevenlabs") {
    if (transport === "whatsapp") {
      summary.push(
        { label: "WhatsApp Phone Number ID", value: readConfigValue(config, "whatsappPhoneNumberId") ?? "Not set" },
        { label: "Permission Template", value: readConfigValue(config, "whatsappCallPermissionRequestTemplateName") ?? "Not set" },
        { label: "Template Language", value: readConfigValue(config, "whatsappCallPermissionRequestTemplateLanguageCode") ?? "Not set" },
      );
    } else {
      summary.push({ label: "Agent Phone Number ID", value: readConfigValue(config, "agentPhoneNumberId") ?? "Not set" });
    }
  }

  if (rule.action.provider === "sarvam") {
    summary.push({ label: "Orchestrator URL", value: readConfigValue(config, "orchestratorBaseUrl") ?? "Env fallback" });
  }

  if (rule.action.provider === "vapi") {
    summary.push({ label: "Phone Number ID", value: readConfigValue(config, "phoneNumberId") ?? "Not set" });
  }

  return summary;
}

function buildSetupChecks(params: {
  rule: RoutingRule | null;
  mode: "single" | "bulk";
  isWhatsappVoice: boolean;
  phone: string;
  whatsappUserId: string;
}): SetupCheck[] {
  const { rule, mode, isWhatsappVoice, phone, whatsappUserId } = params;
  if (!rule) {
    return [{ label: "Select a rule", ok: false }];
  }

  const config = rule.action.config;
  const provider = rule.action.provider;
  const checks: SetupCheck[] = [
    {
      label: "Agent ID configured",
      ok: rule.action.agentId.trim().length > 0,
    },
  ];

  if (provider === "elevenlabs") {
    if (isWhatsappVoice) {
      checks.push(
        { label: "WhatsApp Phone Number ID", ok: Boolean(readConfigValue(config, "whatsappPhoneNumberId")) },
        { label: "Permission template name", ok: Boolean(readConfigValue(config, "whatsappCallPermissionRequestTemplateName")) },
        { label: "Template language code", ok: Boolean(readConfigValue(config, "whatsappCallPermissionRequestTemplateLanguageCode")) },
      );
    } else {
      checks.push({ label: "Agent Phone Number ID", ok: Boolean(readConfigValue(config, "agentPhoneNumberId")) });
    }
  }

  if (provider === "sarvam") {
    checks.push({
      label: "Sarvam orchestrator URL",
      ok: Boolean(readConfigValue(config, "orchestratorBaseUrl")),
      helper: "or backend env SARVAM_VOICE_ORCHESTRATOR_URL",
    });
  }

  if (provider === "vapi") {
    checks.push({ label: "Vapi Phone Number ID", ok: Boolean(readConfigValue(config, "phoneNumberId")) });
  }

  if (mode === "single") {
    if (isWhatsappVoice) {
      checks.push({
        label: "Target WhatsApp user entered",
        ok: whatsappUserId.trim().length > 0 || Boolean(readConfigValue(config, "whatsappUserId")),
      });
    } else {
      checks.push({
        label: "Target phone in E.164 format",
        ok: PHONE_REGEX.test(phone.trim()),
      });
    }
  }

  return checks;
}

export function RuleCallLaunchpadDialog({
  open,
  onOpenChange,
  tenantId,
  entityType,
  configId,
  rule,
  initialMode = "single",
}: RuleCallLaunchpadDialogProps) {
  const executeRouting = useExecuteRouting();
  const bulkCallMutation = useMutation({
    mutationFn: voiceTechApi.runRuleCampaign,
  });

  const [mode, setMode] = useState<"single" | "bulk">(initialMode);
  const [phone, setPhone] = useState("");
  const [whatsappUserId, setWhatsappUserId] = useState("");
  const [customPayload, setCustomPayload] = useState("");

  const isWhatsappVoice = rule?.action.config?.transport === "whatsapp";
  const setupChecks = useMemo(
    () =>
      buildSetupChecks({
        rule,
        mode,
        isWhatsappVoice: Boolean(isWhatsappVoice),
        phone,
        whatsappUserId,
      }),
    [rule, mode, isWhatsappVoice, phone, whatsappUserId],
  );
  const setupReady = setupChecks.every((check) => check.ok);

  const samplePayload = useMemo(() => {
    if (!rule) return {};
    const output: Record<string, unknown> = {};
    collectLeafValues(rule.conditions, output);
    return output;
  }, [rule]);

  const samplePayloadPretty = useMemo(
    () => JSON.stringify(samplePayload, null, 2),
    [samplePayload]
  );

  const configSummary = useMemo(() => buildConfigSummary(rule), [rule]);

  const entitiesMatchQuery = useQueryEntitiesByRule({
    tenantId,
    entityType,
    conditions: rule?.conditions ?? null,
    enabled: open && mode === "bulk" && !!rule,
  });

  const resetDialog = () => {
    setMode(initialMode);
    setPhone("");
    setWhatsappUserId("");
    setCustomPayload("");
  };

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  };

  const handleSingleCall = async () => {
    if (!rule || !configId) {
      toast.error("Cannot start call", {
        description: "Select a routing configuration and rule first.",
      });
      return;
    }

    if (isWhatsappVoice) {
      if (whatsappUserId.trim().length === 0) {
        toast.error("WhatsApp user ID required", {
          description: "Provide WhatsApp user ID (wa_id or phone-based ID) to place a WhatsApp voice call.",
        });
        return;
      }
    } else {
      if (!PHONE_REGEX.test(phone.trim())) {
        toast.error("Invalid phone format", {
          description: "Use international E.164 format like +14155550123.",
        });
        return;
      }
    }

    const missingConfig = getMissingConfigLabels(rule, "single");
    if (missingConfig.length > 0) {
      toast.error("Provider setup incomplete", {
        description: `Please configure: ${missingConfig.join(", ")}.`,
      });
      return;
    }

    let attributes: Record<string, unknown> = samplePayload;
    if (customPayload.trim().length > 0) {
      try {
        attributes = safeJsonParse(customPayload);
      } catch (error) {
        toast.error("Payload JSON is invalid", {
          description: error instanceof Error ? error.message : "Please fix JSON and try again.",
        });
        return;
      }
    }

    try {
      // First resolve routing without external provider execution to avoid unintended calls.
      const preview = await executeRouting.mutateAsync({
        tenantId,
        routingConfigId: configId,
        attributes,
        executeProvider: false,
      });

      if (!preview.matchedRuleId) {
        toast.error("No matching rule found", {
          description: "Adjust payload fields so this rule can match before placing a call.",
        });
        return;
      }

      if (preview.matchedRuleId !== rule.id) {
        toast.error("Different rule matched", {
          description: `Matched rule ${preview.matchedRuleId.slice(0, 8)}. Update payload or priority to target this rule block.`,
        });
        return;
      }

      const execution = await executeRouting.mutateAsync({
        tenantId,
        routingConfigId: configId,
        attributes,
        phone: isWhatsappVoice ? undefined : phone.trim(),
        userId: isWhatsappVoice ? whatsappUserId.trim() : undefined,
        executeProvider: true,
      });

      if (!execution.providerResult?.accepted) {
        toast.error("Provider rejected call", {
          description:
            execution.providerResult?.message ??
            "The provider did not accept this request. Verify provider config and retry.",
        });
        return;
      }

      toast.success("Call request sent", {
        description: execution.providerResult.providerReference
          ? `Reference: ${execution.providerResult.providerReference}`
          : "Request accepted by provider.",
      });
      handleClose(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast.error("Failed to place single call", {
        description: `${message}. Check provider credentials and selected rule configuration.`,
      });
    }
  };

  const handleBulkCall = async () => {
    if (!rule) {
      toast.error("Rule not selected", {
        description: "Pick a rule block before launching a bulk campaign.",
      });
      return;
    }

    const missingConfig = getMissingConfigLabels(rule, "bulk");
    if (missingConfig.length > 0) {
      toast.error("Provider setup incomplete", {
        description: `Please configure: ${missingConfig.join(", ")}.`,
      });
      return;
    }

    try {
      const result = await bulkCallMutation.mutateAsync({
        ruleId: rule.id,
        tenantId,
        entityType,
      });

      if (!result.campaign) {
        toast.success("Campaign started", {
          description: "Rule was activated, but detailed campaign stats are not available yet.",
        });
        handleClose(false);
        return;
      }

      const { total, initiated, failed } = result.campaign;
      if (failed > 0) {
        toast.error("Bulk campaign finished with issues", {
          description: `${initiated}/${total} calls accepted. ${failed} failed. Open logs for full details.`,
        });
      } else {
        toast.success("Bulk campaign launched", {
          description: `${initiated}/${total} calls accepted by provider queue.`,
        });
      }

      handleClose(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      toast.error("Bulk campaign failed", {
        description: `${message}. Verify entity data, phone discovery fields, and provider availability.`,
      });
    }
  };

  const pending = executeRouting.isPending || bulkCallMutation.isPending;
  const accordionDefaults = mode === "single"
    ? ["setup", "single", "summary"]
    : ["setup", "bulk", "summary"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[min(880px,calc(100%-2rem))] !max-w-[880px] p-0 overflow-hidden max-h-[90vh]">
        <div className="bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.18),_transparent_45%),linear-gradient(135deg,hsl(var(--background)),hsl(var(--muted)/0.4))] max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="gap-1 bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-100">
                <Sparkles className="size-3" /> Premium Call Launcher
              </Badge>
              {rule && <ProviderBadge provider={rule.action.provider} />}
            </div>
            <DialogTitle className="text-xl font-black tracking-tight">Rule Call Launchpad</DialogTitle>
            <DialogDescription className="text-xs">
              Start a one-off call for a specific user or launch a bulk call campaign from this rule block.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-172px)] px-6 pb-2">
            <div className="space-y-5 pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl p-1 bg-muted/60 border">
              <button
                type="button"
                className={cn(
                  "rounded-lg px-3 py-2 text-left transition-all",
                  mode === "single"
                    ? "bg-background shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("single")}
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  {isWhatsappVoice ? <MessageCircle className="size-4" /> : <Phone className="size-4" />} Single User Call
                </span>
                <p className="text-[11px] mt-1">
                  {isWhatsappVoice
                    ? "One targeted WhatsApp voice call for a specific user."
                    : "One targeted live call for debugging or high-value outreach."}
                </p>
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-lg px-3 py-2 text-left transition-all",
                  mode === "bulk"
                    ? "bg-background shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMode("bulk")}
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  <Users className="size-4" /> Bulk Campaign
                </span>
                <p className="text-[11px] mt-1">Call all users that match the selected rule conditions.</p>
              </button>
              </div>

              <Accordion type="multiple" defaultValue={accordionDefaults} className="rounded-2xl border bg-background/70 px-4 sm:px-5">
                <AccordionItem value="setup" className="border-border/60">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex w-full items-center justify-between pr-2">
                      <div className="text-left">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Provider Setup Wizard</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Preflight checks for {rule?.action.provider ?? "selected provider"} ({isWhatsappVoice ? "WhatsApp" : "Telephony"}).</p>
                      </div>
                      <Badge className={cn("border ml-2", setupReady ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300")}>
                        {setupReady ? "Ready" : "Needs setup"}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {setupChecks.map((check) => (
                        <div key={check.label} className="rounded-lg border px-3 py-2 flex items-start gap-2 bg-muted/20">
                          {check.ok ? (
                            <CheckCircle2 className="size-4 text-emerald-600 mt-0.5 shrink-0" />
                          ) : (
                            <AlertCircle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className={cn("text-[11px] font-semibold", check.ok ? "text-emerald-700" : "text-amber-700")}>{check.label}</p>
                            {check.helper && <p className="text-[10px] text-muted-foreground">{check.helper}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

              {mode === "single" ? (
                <AccordionItem value="single" className="border-border/60">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      {isWhatsappVoice ? <MessageCircle className="size-4" /> : <Phone className="size-4" />} Single Call Inputs
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">
                            {isWhatsappVoice ? "Target WhatsApp User ID" : "Target Phone"}
                          </Label>
                          {isWhatsappVoice ? (
                            <>
                              <Input
                                value={whatsappUserId}
                                onChange={(e) => setWhatsappUserId(e.target.value)}
                                placeholder="e.g. 15551234567"
                                className="font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">Use WhatsApp user identifier (wa_id or provider-mapped user id).</p>
                            </>
                          ) : (
                            <>
                              <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+14155550123"
                                className="font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">Use E.164 format with country code. Example: +91..., +1..., +44...</p>
                            </>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[11px] uppercase tracking-widest text-muted-foreground">Override Payload (Optional JSON)</Label>
                          <Textarea
                            value={customPayload}
                            onChange={(e) => setCustomPayload(e.target.value)}
                            placeholder={samplePayloadPretty}
                            className="min-h-[170px] font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div className="rounded-2xl border bg-background/80 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Wand2 className="size-4 text-primary" />
                          <h4 className="text-sm font-bold">Rule Snapshot</h4>
                        </div>
                        <div className="space-y-2 text-xs">
                          <p><span className="text-muted-foreground">Rule ID:</span> <span className="font-mono">{rule?.id.slice(0, 12)}...</span></p>
                          <p><span className="text-muted-foreground">Mode:</span> Live single call</p>
                        </div>
                        <div className="rounded-lg border border-amber-300/40 bg-amber-50 p-3 text-[11px] text-amber-800">
                          The launcher validates the matched rule first, then sends a real provider call to avoid accidental calls from another rule.
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <AccordionItem value="bulk" className="border-border/60">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Layers3 className="size-4 text-primary" /> Campaign Scope & Safety
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-muted-foreground">All matching entities from dataset <span className="font-mono">{entityType}</span> will be processed.</p>
                        {entitiesMatchQuery.isLoading ? (
                          <Badge variant="secondary">Calculating...</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                            {(entitiesMatchQuery.data?.length ?? 0).toLocaleString()} matched users
                          </Badge>
                        )}
                      </div>

                      <div className="rounded-xl border border-red-300/40 bg-red-50 p-3 text-[11px] text-red-800 flex gap-2">
                        <AlertCircle className="size-4 mt-0.5 shrink-0" />
                        {isWhatsappVoice
                          ? "Bulk launch is enabled, but verify backend campaign path supports WhatsApp routing in your environment before triggering production traffic."
                          : "Bulk campaigns trigger real outbound calls and may consume provider credits quickly. Confirm data quality before launch."}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border bg-muted/20 p-3">
                          <p className="text-[10px] uppercase text-muted-foreground mb-2">Execution Profile</p>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Dataset</span>
                              <span className="font-medium">{entityType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <span className="font-medium">{rule?.isActive ? "Active" : "Inactive"}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Mode</span>
                              <span className="font-medium">Bulk campaign</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-muted/20 p-3">
                          <p className="text-[10px] uppercase text-muted-foreground mb-2">Dispatch Outcome</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Campaign requests are queued provider-side. Use campaign toast feedback and backend logs to inspect partial failures.
                          </p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

                <AccordionItem value="summary" className="border-border/60">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <Wand2 className="size-4 text-primary" /> Provider Configuration Summary
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {configSummary.map((item) => (
                        <div key={item.label} className="rounded-lg border bg-muted/20 p-2.5 text-[11px]">
                          <p className="text-muted-foreground mb-1">{item.label}</p>
                          <p className="font-medium break-all">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2">
            <Button variant="outline" onClick={() => handleClose(false)} disabled={pending}>Cancel</Button>
            {mode === "single" ? (
              <Button onClick={handleSingleCall} disabled={pending || !rule || !configId} className="gap-2">
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
                {isWhatsappVoice ? "Place WhatsApp Voice Call" : "Place Single Call"}
              </Button>
            ) : (
              <Button
                onClick={handleBulkCall}
                disabled={pending || !rule || entitiesMatchQuery.isLoading}
                className="gap-2 bg-rose-600 hover:bg-rose-700"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
                Launch Bulk Campaign
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
