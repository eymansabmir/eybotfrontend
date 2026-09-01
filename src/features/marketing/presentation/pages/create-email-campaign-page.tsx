import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { WizardStepper, type WizardStep } from "../components/shared/wizard-stepper";
import { EMAIL_TEMPLATES } from "../../data/email-campaigns.mock";
import { useMarketingStore } from "../../data/marketing-store";
import type { EmailCampaign } from "../../types";

const STEPS: WizardStep[] = [
  { id: "setup", name: "Setup", description: "Type and identity" },
  { id: "audience", name: "Audience", description: "Lists and suppressions" },
  { id: "content", name: "Content", description: "Template and subject" },
  { id: "qa", name: "QA & testing", description: "A/B, spam, preview" },
  { id: "schedule", name: "Schedule", description: "Send time and STO" },
  { id: "review", name: "Review", description: "Approvals and launch" },
];

export function CreateEmailCampaignPage() {
  const navigate = useNavigate();
  const addEmail = useMarketingStore((s) => s.addEmail);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [campaignType, setCampaignType] = useState("one-time");
  const [fromName, setFromName] = useState("EY Managed Services");
  const [fromEmail, setFromEmail] = useState("managed.services@ey.com");
  const [replyTo, setReplyTo] = useState("managed.services@ey.com");
  const [listId, setListId] = useState("enterprise");
  const [frequencyCap, setFrequencyCap] = useState(true);
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [templateId, setTemplateId] = useState("newsletter");
  const [abTest, setAbTest] = useState(false);
  const [subjectB, setSubjectB] = useState("");
  const [sendTimeOpt, setSendTimeOpt] = useState(true);
  const [submitForApproval, setSubmitForApproval] = useState(true);

  const listSize = listId === "all-subscribers" ? 28400 : listId === "enterprise" ? 12100 : 5800;
  const suppressed = 412;
  const eligible = listSize - suppressed;

  const handleFinish = (mode: "draft" | "submit") => {
    const campaign: EmailCampaign = {
      id: `email-${Date.now()}`,
      name,
      subject,
      fromName,
      fromEmail,
      listSize: eligible,
      status: mode === "draft" ? "draft" : submitForApproval ? "pending_approval" : "scheduled",
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      unsubscribeRate: 0,
      hasAbTest: abTest,
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0, bounced: 0, unsubscribed: 0 },
      openHeatmap: [],
      linkClicks: [],
      bounces: { hard: 0, soft: 0 },
      clients: [],
      recipients: [],
      ...(abTest
        ? {
            abVariants: [
              { variant: "A", subject, openRate: 0, clickRate: 0 },
              { variant: "B", subject: subjectB, openRate: 0, clickRate: 0 },
            ],
          }
        : {}),
    };
    addEmail(campaign);
    toast.success(mode === "draft" ? "Draft saved — roadmap preview only." : "Submitted for approval — roadmap preview only.");
    void navigate({ to: "/email-campaigns" });
  };

  const canContinue = () => {
    if (step === 0) return name.trim().length > 2;
    if (step === 2) return subject.trim().length > 3;
    return true;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <RoadmapBanner />
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Email · Campaign builder</p>
        <h1 className="mt-1 text-2xl font-bold">Create email campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Standard ESP flow: authenticated identity, suppression, content QA, then approval before send.
        </p>
      </div>

      <WizardStepper steps={STEPS} current={step} onStepSelect={(i) => i <= step && setStep(i)} />

      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <Field label="Campaign name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q1 Managed Services newsletter" />
              </Field>
              <div className="space-y-3">
                <Label>Campaign type</Label>
                <RadioGroup value={campaignType} onValueChange={setCampaignType} className="grid gap-3 sm:grid-cols-3">
                  <TypeCard id="one-time" value="one-time" title="One-time send" detail="Single blast after approval" />
                  <TypeCard id="ab" value="ab" title="A/B test" detail="Subject or content experiment, then winner" />
                  <TypeCard id="nurture" value="nurture" title="Nurture / drip" detail="Multi-step journey (preview)" />
                </RadioGroup>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="From name"><Input value={fromName} onChange={(e) => setFromName(e.target.value)} /></Field>
                <Field label="From email"><Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} /></Field>
                <Field label="Reply-to"><Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} /></Field>
                <Field label="Domain authentication" hint="SPF · DKIM · DMARC aligned">
                  <Input value="ey.com — Pass / Pass / Pass" readOnly />
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="Audience list">
                <Select value={listId} onValueChange={setListId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-subscribers">All subscribers — 28,400</SelectItem>
                    <SelectItem value="enterprise">Enterprise segment — 12,100</SelectItem>
                    <SelectItem value="finops">FinOps interested — 5,800</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="List size" value={listSize.toLocaleString()} />
                <Metric label="Suppressed" value={suppressed.toLocaleString()} />
                <Metric label="Eligible" value={eligible.toLocaleString()} />
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-suppressed: hard bounces, unsubscribes, spam complaints, and role addresses.
              </p>
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <Label htmlFor="cap">Frequency cap</Label>
                  <p className="text-xs text-muted-foreground">Max 2 marketing emails per contact / 7 days</p>
                </div>
                <Switch id="cap" checked={frequencyCap} onCheckedChange={setFrequencyCap} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Field label="Subject line">
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Q1 2026: Managed Services trends" />
              </Field>
              <Field label="Preview text" hint="Shown in the inbox next to the subject">
                <Input value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                {EMAIL_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all hover:border-primary/50",
                      templateId === t.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border",
                    )}
                  >
                    <div className="mb-2 h-16 rounded-lg bg-muted/60" />
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <Label>A/B subject test</Label>
                  <p className="text-xs text-muted-foreground">20% holdout, winner after 4 hours, then remainder</p>
                </div>
                <Switch checked={abTest || campaignType === "ab"} onCheckedChange={setAbTest} />
              </div>
              {(abTest || campaignType === "ab") && (
                <Field label="Subject variant B">
                  <Input value={subjectB} onChange={(e) => setSubjectB(e.target.value)} placeholder="Alternative subject" />
                </Field>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Spam score" value="1.8 / 10" />
                <Metric label="Inbox preview" value="Gmail · Outlook" />
                <Metric label="UTM tagged" value="Yes" />
              </div>
              <div className="rounded-lg border bg-muted/20 p-4 text-sm">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Inbox preview</p>
                <p className="mt-2 font-medium">{fromName}</p>
                <p className="text-primary">{subject || "Subject line"}</p>
                <p className="text-xs text-muted-foreground">{previewText || "Preview text appears here"}</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <Field label="Send plan">
                <Select defaultValue="scheduled">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Send after approval</SelectItem>
                    <SelectItem value="scheduled">Mar 5, 10:00 AM IST</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <Label>Send-time optimization</Label>
                  <p className="text-xs text-muted-foreground">Deliver in each recipient’s historical open window</p>
                </div>
                <Switch checked={sendTimeOpt} onCheckedChange={setSendTimeOpt} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Review label="Name" value={name} />
                <Review label="Type" value={campaignType} />
                <Review label="From" value={`${fromName} <${fromEmail}>`} />
                <Review label="Subject" value={subject} />
                <Review label="Template" value={EMAIL_TEMPLATES.find((t) => t.id === templateId)?.name ?? ""} />
                <Review label="Audience" value={`${eligible.toLocaleString()} eligible`} />
              </dl>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox checked={submitForApproval} onCheckedChange={(v) => setSubmitForApproval(Boolean(v))} />
                <span>
                  <span className="block text-sm font-medium">Submit to approval chain</span>
                  <span className="text-xs text-muted-foreground">Legal / brand review before any marketing send.</span>
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => (step === 0 ? navigate({ to: "/email-campaigns" }) : setStep(step - 1))}>
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
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
