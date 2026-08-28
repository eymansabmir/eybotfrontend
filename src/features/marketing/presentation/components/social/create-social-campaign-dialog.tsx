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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { platformLabels } from "../../../data/social-campaigns.mock";
import type { SocialCampaign, SocialPlatform } from "../../../types";

const STEPS = ["Objective", "Platforms", "Content", "Schedule", "Review"];
const ALL_PLATFORMS: SocialPlatform[] = ["linkedin", "x", "facebook", "instagram"];

interface CreateSocialCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (campaign: SocialCampaign) => void;
}

export function CreateSocialCampaignDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateSocialCampaignDialogProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState<SocialCampaign["objective"]>("awareness");
  const [platforms, setPlatforms] = useState<SocialPlatform[]>(["linkedin"]);
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("#ManagedServices #EY");

  const togglePlatform = (p: SocialPlatform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  };

  const reset = () => {
    setStep(0);
    setName("");
    setObjective("awareness");
    setPlatforms(["linkedin"]);
    setCaption("");
    setHashtags("#ManagedServices #EY");
  };

  const handleSubmit = () => {
    const campaign: SocialCampaign = {
      id: `social-${Date.now()}`,
      name,
      objective,
      platforms,
      postsCount: platforms.length,
      status: "scheduled",
      reach: 0,
      impressions: 0,
      engagementRate: 0,
      followerGrowth: 0,
      stats: { likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 },
      platformStats: platforms.map((p) => ({ platform: p, reach: 0, engagement: 0, posts: 1 })),
      posts: [],
      engagementTrend: [],
      demographics: { age: [], gender: [], locations: [] },
      hashtags: [],
      calendar: [],
    };
    onCreated(campaign);
    toast.success("Social campaign scheduled — roadmap preview only.");
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Social Media Campaign</DialogTitle>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
        </DialogHeader>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2"><Label>Campaign name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Objective</Label>
              <Select value={objective} onValueChange={(v) => setObjective(v as SocialCampaign["objective"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                </SelectContent>
              </Select>
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
                  "rounded-xl border p-4 text-left transition-all",
                  platforms.includes(p) ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30",
                )}
              >
                <p className="font-medium">{platformLabels[p]}</p>
                <p className="text-xs text-muted-foreground">
                  {p === "linkedin" && "Max 3,000 chars · B2B focus"}
                  {p === "x" && "Max 280 chars · Real-time engagement"}
                  {p === "facebook" && "Max 63,206 chars · Broad reach"}
                  {p === "instagram" && "Max 2,200 chars · Visual-first"}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Caption</Label>
              <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} placeholder="Write your post caption..." />
              <p className="text-xs text-muted-foreground">{caption.length} characters</p>
            </div>
            <div className="space-y-2">
              <Label>Hashtags</Label>
              <Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} />
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Drag & drop image or video (PNG, JPG, MP4 up to 50MB)
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Schedule date & time</Label>
              <Input type="datetime-local" defaultValue="2026-03-10T10:00" />
            </div>
            <div className="rounded-lg bg-muted/30 p-4 text-sm">
              <p className="font-medium mb-2">Best time suggestions</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>LinkedIn: Tue–Thu, 9–11 AM IST</li>
                <li>X: Mon–Fri, 12–1 PM IST</li>
                <li>Instagram: Wed–Fri, 7–9 PM IST</li>
              </ul>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {platforms.map((p) => (
              <div key={p} className="rounded-xl border p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{platformLabels[p]} preview</p>
                <div className="rounded-lg bg-muted/30 p-3 text-sm">
                  <p>{caption || "Your caption..."}</p>
                  <p className="mt-2 text-primary text-xs">{hashtags}</p>
                  {p === "instagram" || p === "facebook" ? (
                    <div className="mt-3 aspect-square rounded bg-muted" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={(step === 0 && !name) || (step === 1 && platforms.length === 0)}>Continue</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!name}>Schedule Campaign</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
