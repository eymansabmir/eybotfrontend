import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EMAIL_TEMPLATES } from "../../../data/email-campaigns.mock";
import type { EmailCampaign } from "../../../types";

const STEPS = ["Details", "Template", "Audience", "A/B Test", "Schedule", "Review"];

interface CreateEmailCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaign: EmailCampaign) => void;
}

export function CreateEmailCampaignDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateEmailCampaignDialogProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [fromName, setFromName] = useState("EY Managed Services");
  const [fromEmail, setFromEmail] = useState("managed.services@ey.com");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [templateId, setTemplateId] = useState("newsletter");
  const [abTest, setAbTest] = useState(false);
  const [subjectB, setSubjectB] = useState("");
  const [sendTimeOpt, setSendTimeOpt] = useState(true);

  const reset = () => {
    setStep(0);
    setName("");
    setSubject("");
    setPreviewText("");
    setTemplateId("newsletter");
    setAbTest(false);
    setSubjectB("");
  };

  const handleSubmit = () => {
    const campaign: EmailCampaign = {
      id: `email-${Date.now()}`,
      name,
      subject,
      fromName,
      fromEmail,
      listSize: 10000,
      status: "scheduled",
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
      ...(abTest ? { abVariants: [
        { variant: "A", subject, openRate: 0, clickRate: 0 },
        { variant: "B", subject: subjectB, openRate: 0, clickRate: 0 },
      ] } : {}),
    };
    onCreated(campaign);
    toast.success("Email campaign scheduled — roadmap preview only.");
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Campaign name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>From name</Label><Input value={fromName} onChange={(e) => setFromName(e.target.value)} /></div>
              <div className="space-y-2"><Label>From email</Label><Input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Subject line</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div className="space-y-2"><Label>Preview text</Label><Input value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Shown in inbox before opening" /></div>
          </div>
        )}

        {step === 1 && (
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
                <div className="mb-2 h-20 rounded-lg bg-muted/50" />
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Mailing list</Label>
              <Select defaultValue="all-subscribers">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-subscribers">All subscribers — 28,400</SelectItem>
                  <SelectItem value="enterprise">Enterprise segment — 12,100</SelectItem>
                  <SelectItem value="finops">FinOps interested — 5,800</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Suppression lists</Label>
              <Select defaultValue="default">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default suppressions (bounced, unsubscribed)</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable A/B subject test</Label>
              <Switch checked={abTest} onCheckedChange={setAbTest} />
            </div>
            {abTest ? (
              <div className="space-y-2">
                <Label>Subject variant B</Label>
                <Input value={subjectB} onChange={(e) => setSubjectB(e.target.value)} placeholder="Alternative subject line" />
                <p className="text-xs text-muted-foreground">50/50 split, winner selected after 4 hours</p>
              </div>
            ) : null}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Send time</Label>
              <Select defaultValue="scheduled">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send now</SelectItem>
                  <SelectItem value="scheduled">Schedule for Mar 5, 10:00 AM IST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Send-time optimization</Label>
                <p className="text-xs text-muted-foreground">Deliver when each recipient is most likely to open</p>
              </div>
              <Switch checked={sendTimeOpt} onCheckedChange={setSendTimeOpt} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Campaign:</span> {name}</p>
              <p><span className="text-muted-foreground">Subject:</span> {subject}</p>
              <p><span className="text-muted-foreground">Template:</span> {EMAIL_TEMPLATES.find((t) => t.id === templateId)?.name}</p>
              <p><span className="text-muted-foreground">A/B test:</span> {abTest ? "Enabled" : "Disabled"}</p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Desktop preview</p>
              <div className="rounded border bg-background p-3 text-sm">
                <p className="font-medium">{fromName}</p>
                <p className="text-primary">{subject || "Subject line"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{previewText || "Preview text appears here..."}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !name}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!name || !subject}>Schedule Campaign</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
