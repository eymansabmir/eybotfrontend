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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SmsCampaign } from "../../../types";

const STEPS = ["Message", "Audience", "Schedule", "Review"];

interface CreateSmsCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaign: SmsCampaign) => void;
}

export function CreateSmsCampaignDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateSmsCampaignDialogProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [senderId, setSenderId] = useState("EYMSVC");
  const [message, setMessage] = useState("");
  const [optOutFooter, setOptOutFooter] = useState(true);
  const [segment, setSegment] = useState("enterprise-cxo");
  const [schedule, setSchedule] = useState("now");
  const [throttle, setThrottle] = useState("50");

  const fullMessage = optOutFooter && !message.includes("STOP")
    ? `${message} STOP to opt-out.`
    : message;

  const charCount = fullMessage.length;
  const segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  const reset = () => {
    setStep(0);
    setName("");
    setSenderId("EYMSVC");
    setMessage("");
    setOptOutFooter(true);
    setSegment("enterprise-cxo");
    setSchedule("now");
    setThrottle("50");
  };

  const handleSubmit = () => {
    const campaign: SmsCampaign = {
      id: `sms-${Date.now()}`,
      name,
      senderId,
      message: fullMessage,
      audienceSize: 5000,
      status: schedule === "now" ? "scheduled" : "scheduled",
      scheduledAt: schedule === "later" ? new Date(Date.now() + 86400000).toISOString() : undefined,
      deliveryRate: 0,
      clickRate: 0,
      optOutRate: 0,
      failureRate: 0,
      dndScrubbed: 120,
      stats: { queued: 5000, sent: 0, delivered: 0, clicked: 0, converted: 0, failed: 0, optOut: 0 },
      timeline: [],
      carriers: [],
      deliveryLog: [],
    };
    onCreated(campaign);
    toast.success("SMS campaign scheduled — roadmap preview only.");
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create SMS Campaign</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Q2 Outreach Campaign" />
            </div>
            <div className="space-y-2">
              <Label>Sender ID / Short code</Label>
              <Input value={senderId} onChange={(e) => setSenderId(e.target.value.toUpperCase())} maxLength={6} />
            </div>
            <div className="space-y-2">
              <Label>Message body</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Your SMS message..." />
              <p className="text-xs text-muted-foreground">
                {charCount} chars · {segments} segment{segments > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="opt-out">Include opt-out footer</Label>
              <Switch id="opt-out" checked={optOutFooter} onCheckedChange={setOptOutFooter} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Audience segment</Label>
              <Select value={segment} onValueChange={setSegment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="enterprise-cxo">Enterprise CXO — 12,400 contacts</SelectItem>
                  <SelectItem value="it-leaders">IT Leaders — 8,900 contacts</SelectItem>
                  <SelectItem value="finance-ops">Finance Ops — 6,200 contacts</SelectItem>
                  <SelectItem value="custom">Upload CSV (custom list)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Drag & drop CSV file here, or click to browse
              <br />
              <span className="text-xs">Columns: phone, first_name, company (optional)</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Send timing</Label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Send immediately</SelectItem>
                  <SelectItem value="later">Schedule for later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select defaultValue="ist">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Throttling (messages/sec)</Label>
              <Select value={throttle} onValueChange={setThrottle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 msg/sec</SelectItem>
                  <SelectItem value="50">50 msg/sec</SelectItem>
                  <SelectItem value="100">100 msg/sec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <p><span className="text-muted-foreground">Campaign:</span> {name || "—"}</p>
              <p><span className="text-muted-foreground">Sender:</span> {senderId}</p>
              <p><span className="text-muted-foreground">Segment:</span> {segment}</p>
              <p><span className="text-muted-foreground">Schedule:</span> {schedule === "now" ? "Immediate" : "Scheduled"}</p>
            </div>
            <div className="mx-auto w-48 rounded-3xl border-4 border-border bg-muted/30 p-4 shadow-lg">
              <div className="mb-2 text-center text-[10px] text-muted-foreground">Preview</div>
              <div className="rounded-2xl bg-background p-3 text-xs leading-relaxed shadow-inner">
                {fullMessage || "Your message preview..."}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !name}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!name || !message}>
              Schedule Campaign
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
