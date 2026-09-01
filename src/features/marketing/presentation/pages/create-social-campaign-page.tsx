import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { WizardStepper, type WizardStep } from "../components/shared/wizard-stepper";
import { platformLabels } from "../../data/social-campaigns.mock";
import { useMarketingStore } from "../../data/marketing-store";
import type { SocialCampaign, SocialPlatform } from "../../types";

const STEPS: WizardStep[] = [
  { id: "objective", name: "Objective", description: "Organic vs paid goal" },
  { id: "channels", name: "Channels", description: "Accounts and platforms" },
  { id: "audience", name: "Audience", description: "Targeting and geo" },
  { id: "creative", name: "Creative", description: "Copy, asset, hashtags" },
  { id: "schedule", name: "Calendar", description: "Slots and budget" },
  { id: "review", name: "Review", description: "Legal and brand gate" },
];

const ALL_PLATFORMS: SocialPlatform[] = ["linkedin", "x", "facebook", "instagram"];

export function CreateSocialCampaignPage() {
  const navigate = useNavigate();
  const addSocial = useMarketingStore((s) => s.addSocial);
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [mediaType, setMediaType] = useState("organic");
  const [objective, setObjective] = useState<SocialCampaign["objective"]>("awareness");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(["linkedin"]);
  const [geo, setGeo] = useState("India · CXO / IT leadership");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("#ManagedServices #EY");
  const [budget, setBudget] = useState("250000");
  const [submitForApproval, setSubmitForApproval] = useState(true);

  const togglePlatform = (p: SocialPlatform) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleFinish = (mode: "draft" | "submit") => {
    const campaign: SocialCampaign = {
      id: `social-${Date.now()}`,
      name,
      objective,
      platforms,
      postsCount: platforms.length,
      status: mode === "draft" ? "draft" : submitForApproval ? "pending_approval" : "scheduled",
      reach: 0,
      impressions: 0,
      engagementRate: 0,
      followerGrowth: 0,
      stats: { likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 },
      platformStats: platforms.map((p) => ({ platform: p, reach: 0, engagement: 0, posts: 1 })),
      posts: [],
      engagementTrend: [],
      demographics: { age: [], gender: [], locations: [] },
      hashtags: hashtags.split(/\s+/).filter(Boolean).map((tag) => ({ tag, uses: 0, reach: 0 })),
      calendar: [],
    };
    addSocial(campaign);
    toast.success(mode === "draft" ? "Draft saved — roadmap preview only." : "Submitted for approval — roadmap preview only.");
    void navigate({ to: "/social-campaigns" });
  };

  const canContinue = () => {
    if (step === 0) return name.trim().length > 2;
    if (step === 1) return platforms.length > 0;
    return true;
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <RoadmapBanner />
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Social · Campaign builder</p>
        <h1 className="mt-1 text-2xl font-bold">Create social campaign</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Social ops flow: objective → channels → targeting → creative → calendar → brand approval.
        </p>
      </div>

      <WizardStepper steps={STEPS} current={step} onStepSelect={(i) => i <= step && setStep(i)} />

      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-6">
              <Field label="Campaign name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Thought leadership — Q2" />
              </Field>
              <div className="space-y-3">
                <Label>Activation type</Label>
                <RadioGroup value={mediaType} onValueChange={setMediaType} className="grid gap-3 sm:grid-cols-2">
                  <TypeCard id="organic" value="organic" title="Organic" detail="Owned posts on connected brand accounts" />
                  <TypeCard id="paid" value="paid" title="Paid / boosted" detail="Budget, bid, and audience targeting" />
                </RadioGroup>
              </div>
              <div className="space-y-3">
                <Label>Objective</Label>
                <RadioGroup value={objective} onValueChange={(v) => setObjective(v as SocialCampaign["objective"])} className="grid gap-3 sm:grid-cols-2">
                  <TypeCard id="awareness" value="awareness" title="Awareness" detail="Reach and impressions" />
                  <TypeCard id="engagement" value="engagement" title="Engagement" detail="Comments, shares, follows" />
                  <TypeCard id="traffic" value="traffic" title="Website traffic" detail="Clicks to ey.com" />
                  <TypeCard id="leads" value="leads" title="Lead generation" detail="Form fills and gated assets" />
                </RadioGroup>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={cn(
                    "rounded-xl border p-4 text-left",
                    platforms.includes(p) ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30",
                  )}
                >
                  <p className="font-medium">{platformLabels[p]}</p>
                  <p className="text-xs text-muted-foreground">
                    Connected as EY Managed Services · {p === "linkedin" ? "Page + Showcase" : "Brand account"}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Targeting summary" hint="Used for paid; stored as recommended audience for organic">
                <Input value={geo} onChange={(e) => setGeo(e.target.value)} />
              </Field>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Est. reach" value="180k – 240k" />
                <Metric label="Seniority" value="Director+" />
                <Metric label="Industries" value="BFSI, Tech, GCC" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <Field label="Primary caption">
                  <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} placeholder="Write the hero post..." />
                </Field>
                <Field label="Hashtags">
                  <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
                </Field>
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Creative asset — 1:1 and 1.91:1 required for paid
                </div>
              </div>
              <div className="space-y-3">
                {platforms.map((p) => (
                  <div key={p} className="rounded-xl border p-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{platformLabels[p]}</p>
                    <p className="text-sm">{caption || "Caption preview"}</p>
                    <p className="mt-2 text-xs text-primary">{hashtags}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <Field label="First publish slot">
                <Input type="datetime-local" defaultValue="2026-03-10T10:00" />
              </Field>
              {mediaType === "paid" ? (
                <Field label="Lifetime budget (INR)">
                  <Input value={budget} onChange={(e) => setBudget(e.target.value)} />
                </Field>
              ) : (
                <div className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                  Best-time suggestions: LinkedIn Tue–Thu 09:00–11:00 IST · X weekday noon · Instagram 19:00–21:00 IST
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Review label="Name" value={name} />
                <Review label="Type" value={`${mediaType} · ${objective}`} />
                <Review label="Channels" value={platforms.map((p) => platformLabels[p]).join(", ")} />
                <Review label="Audience" value={geo} />
              </dl>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox checked={submitForApproval} onCheckedChange={(v) => setSubmitForApproval(Boolean(v))} />
                <span>
                  <span className="block text-sm font-medium">Submit to brand & legal</span>
                  <span className="text-xs text-muted-foreground">Required before publishing on official EY channels.</span>
                </span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => (step === 0 ? navigate({ to: "/social-campaigns" }) : setStep(step - 1))}>
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
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
