import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { WizardStepper, type WizardStep } from "../components/shared/wizard-stepper";
import { useMarketingStore } from "../../data/marketing-store";
import type { SmsCampaign } from "../../types";

const STEPS: WizardStep[] = [
  { id: "setup", name: "Setup", description: "Type, name, objective" },
  { id: "sender", name: "Sender & DLT", description: "Header, PE-ID, template" },
  { id: "audience", name: "Audience", description: "Segment, DND, consent" },
  { id: "content", name: "Content", description: "Template variables" },
  { id: "delivery", name: "Delivery", description: "Window, throttle, retry" },
  { id: "review", name: "Review", description: "Approvals and launch" },
];

const SEGMENTS: Record<string, { label: string; size: number; dnd: number }> = {
  "enterprise-cxo": { label: "Enterprise CXO", size: 12400, dnd: 186 },
  "it-leaders": { label: "IT Leaders", size: 8900, dnd: 142 },
  "finance-ops": { label: "Finance Ops", size: 6200, dnd: 98 },
};

export function CreateSmsCampaignPage() {
  const navigate = useNavigate();
  const addSms = useMarketingStore((s) => s.addSms);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("promotional");
  const [objective, setObjective] = useState("awareness");
  const [senderId, setSenderId] = useState("EYMSVC");
  const [peId, setPeId] = useState("110200001234");
  const [templateId, setTemplateId] = useState("1107161234567890123");
  const [templateBody, setTemplateBody] = useState(
    "Discover how EY Managed Services can reduce operating costs. Book a consult: {#var#} STOP to opt-out.",
  );
  const [link, setLink] = useState("ey.com/ms");
  const [segment, setSegment] = useState("enterprise-cxo");
  const [consentOnly, setConsentOnly] = useState(true);
  const [dndScrub, setDndScrub] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [schedule, setSchedule] = useState("later");
  const [throttle, setThrottle] = useState("50");
  const [retryFailed, setRetryFailed] = useState(true);
  const [submitForApproval, setSubmitForApproval] = useState(true);

  const audience = SEGMENTS[segment];
  const eligible = dndScrub ? audience.size - audience.dnd : audience.size;
  const rendered = templateBody.replace("{#var#}", link);
  const charCount = rendered.length;
  const parts = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  const canContinue = () => {
    if (step === 0) return name.trim().length > 2;
    if (step === 1) return senderId.length >= 3 && templateId.length > 6;
    if (step === 3) return rendered.trim().length > 10;
    return true;
  };

  const handleFinish = (mode: "draft" | "submit") => {
    const campaign: SmsCampaign = {
      id: `sms-${Date.now()}`,
      name,
      senderId,
      message: rendered,
      audienceSize: eligible,
      status: mode === "draft" ? "draft" : submitForApproval ? "pending_approval" : "scheduled",
      scheduledAt: schedule === "later" ? new Date(Date.now() + 86400000).toISOString() : undefined,
      deliveryRate: 0,
      clickRate: 0,
      optOutRate: 0,
      failureRate: 0,
      traiTemplateId: templateId,
      dndScrubbed: dndScrub ? audience.dnd : 0,
      stats: { queued: eligible, sent: 0, delivered: 0, clicked: 0, converted: 0, failed: 0, optOut: 0 },
      timeline: [],
      carriers: [],
      deliveryLog: [],
    };
    addSms(campaign);
    toast.success(
      mode === "draft"
        ? "Draft saved — roadmap preview only."
        : submitForApproval
          ? "Submitted to approval chain — roadmap preview only."
          : "Campaign queued — roadmap preview only.",
    );
    void navigate({ to: "/sms-campaigns" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <RoadmapBanner />
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">SMS · Campaign builder</p>
        <h1 className="mt-1 text-2xl font-bold">Create SMS campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Industry flow: classify traffic, bind a DLT template, scrub audience, then gate launch behind approval.
        </p>
      </div>

      <WizardStepper steps={STEPS} current={step} onStepSelect={(i) => i <= step && setStep(i)} />

      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Campaign name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q2 Managed Services outreach" />
              </div>
              <div className="space-y-3">
                <Label>Traffic type</Label>
                <RadioGroup value={purpose} onValueChange={setPurpose} className="grid gap-3 sm:grid-cols-3">
                  <TypeCard id="promotional" value="promotional" title="Promotional" detail="Consent + DND + quiet hours required (TRAI)" />
                  <TypeCard id="service" value="service" title="Service" detail="Account or event updates the user opted into" />
                  <TypeCard id="transactional" value="transactional" title="Transactional" detail="OTP, alerts — not for marketing copy" />
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Business objective</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Awareness / nurture</SelectItem>
                    <SelectItem value="event">Event registration</SelectItem>
                    <SelectItem value="lead">Lead / callback</SelectItem>
                    <SelectItem value="reminder">Reminder / no-show recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Sender ID / header" hint="6-char alpha header registered on DLT">
                  <Input value={senderId} maxLength={6} onChange={(e) => setSenderId(e.target.value.toUpperCase())} />
                </Field>
                <Field label="Principal Entity ID">
                  <Input value={peId} onChange={(e) => setPeId(e.target.value)} />
                </Field>
                <Field label="DLT / TRAI template ID" hint="Must match the approved template body">
                  <Input value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
                </Field>
                <Field label="Template status">
                  <Input value="Approved · Promotional" readOnly />
                </Field>
              </div>
              <Field label="Registered template body">
                <Textarea value={templateBody} onChange={(e) => setTemplateBody(e.target.value)} rows={4} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Field label="Audience segment">
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEGMENTS).map(([id, s]) => (
                      <SelectItem key={id} value={id}>
                        {s.label} — {s.size.toLocaleString()} contacts
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="In segment" value={audience.size.toLocaleString()} />
                <Metric label="DND / NDNC" value={audience.dnd.toLocaleString()} />
                <Metric label="Eligible" value={eligible.toLocaleString()} />
              </div>
              <ToggleRow
                id="consent"
                label="Send only to explicit SMS opt-in"
                hint="Promotional traffic must have recorded consent"
                checked={consentOnly}
                onChange={setConsentOnly}
              />
              <ToggleRow
                id="dnd"
                label="Scrub DND / NDNC before queue"
                hint={`${audience.dnd} numbers will be excluded`}
                checked={dndScrub}
                onChange={setDndScrub}
              />
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Optional CSV overlay — columns: msisdn, first_name, company, consent_source
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Field label="Variable {#var#}" hint="Mapped to the registered template slot">
                  <Input value={link} onChange={(e) => setLink(e.target.value)} />
                </Field>
                <p className="text-xs text-muted-foreground">
                  {charCount} characters · {parts} SMS part{parts > 1 ? "s" : ""} · GSM-7 estimated
                </p>
              </div>
              <div className="mx-auto w-56 rounded-[2rem] border-4 border-border bg-muted/40 p-4">
                <p className="mb-2 text-center text-[10px] uppercase text-muted-foreground">{senderId}</p>
                <div className="rounded-2xl bg-background p-3 text-xs leading-relaxed shadow-inner">{rendered}</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <Field label="Send timing">
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Queue after approval</SelectItem>
                    <SelectItem value="later">Schedule for tomorrow 10:00 IST</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Throughput cap">
                <Select value={throttle} onValueChange={setThrottle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 msg/sec — safer for new headers</SelectItem>
                    <SelectItem value="50">50 msg/sec — standard</SelectItem>
                    <SelectItem value="100">100 msg/sec — high volume</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <ToggleRow
                id="quiet"
                label="Respect TRAI quiet hours (21:00–09:00 IST)"
                hint="Promotional SMS is blocked outside the allowed window"
                checked={quietHours}
                onChange={setQuietHours}
              />
              <ToggleRow
                id="retry"
                label="Retry carrier failures (max 2)"
                hint="Does not retry DND, invalid, or opted-out numbers"
                checked={retryFailed}
                onChange={setRetryFailed}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <ReviewRow label="Name" value={name} />
                <ReviewRow label="Traffic" value={purpose} />
                <ReviewRow label="Sender" value={senderId} />
                <ReviewRow label="Template" value={templateId} />
                <ReviewRow label="Audience" value={`${audience.label} · ${eligible.toLocaleString()} eligible`} />
                <ReviewRow label="Delivery" value={`${schedule === "later" ? "Tomorrow 10:00 IST" : "After approval"} · ${throttle} msg/s`} />
              </dl>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox checked={submitForApproval} onCheckedChange={(v) => setSubmitForApproval(Boolean(v))} />
                <span>
                  <span className="block text-sm font-medium">Submit to approval chain</span>
                  <span className="text-xs text-muted-foreground">
                    Compliance → Brand → Delivery ops. Required for promotional traffic in this workspace.
                  </span>
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => (step === 0 ? navigate({ to: "/sms-campaigns" }) : setStep(step - 1))}>
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <div className="flex gap-2">
              {step === STEPS.length - 1 ? (
                <>
                  <Button variant="outline" onClick={() => handleFinish("draft")} disabled={!name}>Save draft</Button>
                  <Button onClick={() => handleFinish("submit")} disabled={!canContinue()}>
                    {submitForApproval ? "Submit for approval" : "Schedule"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setStep(step + 1)} disabled={!canContinue()}>Continue</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TypeCard({ id, value, title, detail }: { id: string; value: string; title: string; detail: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <RadioGroupItem id={id} value={value} className="mt-1" />
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </span>
    </label>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ToggleRow({
  id, label, hint, checked, onChange,
}: { id: string; label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
