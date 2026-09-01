import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RoadmapBanner } from "../components/shared/roadmap-banner";
import { WizardStepper, type WizardStep } from "../components/shared/wizard-stepper";
import { useMarketingStore } from "../../data/marketing-store";

const STEPS: WizardStep[] = [
  { id: "define", name: "Define query", description: "Boolean listen string" },
  { id: "sources", name: "Sources", description: "Channels to monitor" },
  { id: "scope", name: "Scope", description: "Markets and languages" },
  { id: "alerts", name: "Alerts", description: "Thresholds and owners" },
  { id: "review", name: "Review", description: "Activate listen topic" },
];

const SOURCE_OPTIONS = ["LinkedIn", "X", "News", "Reviews", "Forums", "WhatsApp public"];
const MARKET_OPTIONS = ["India", "SEA", "UK", "US", "Middle East"];
const LANG_OPTIONS = ["English", "Hindi", "Tamil", "Arabic"];

export function CreateListenQueryPage() {
  const navigate = useNavigate();
  const addListenQuery = useMarketingStore((s) => s.addListenQuery);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [query, setQuery] = useState(`"EY Managed Services" OR "Ernst & Young managed services"`);
  const [sources, setSources] = useState<string[]>(["LinkedIn", "X", "News"]);
  const [markets, setMarkets] = useState<string[]>(["India"]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [threshold, setThreshold] = useState("25");
  const [owner, setOwner] = useState("brand.ops@ey.com");

  const toggle = (list: string[], value: string, setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const handleFinish = (activate: boolean) => {
    addListenQuery({
      id: `lq-${Date.now()}`,
      name,
      query,
      sources,
      markets,
      languages,
      status: activate ? "active" : "draft",
      mentions24h: 0,
      sentiment: 70,
      alertThreshold: Number(threshold) || 25,
    });
    toast.success(activate ? "Listen query activated — roadmap preview only." : "Listen query saved as draft.");
    void navigate({ to: "/sentiment-analysis" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <RoadmapBanner />
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Sentiment · Listen setup</p>
        <h1 className="mt-1 text-2xl font-bold">Create listen query</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Brandwatch / Sprinklr-style setup: boolean query, sources, market scope, then alert routing.
        </p>
      </div>

      <WizardStepper steps={STEPS} current={step} onStepSelect={(i) => i <= step && setStep(i)} />

      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Topic name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="EY Managed Services brand" />
              </div>
              <div className="space-y-2">
                <Label>Boolean query</Label>
                <Textarea value={query} onChange={(e) => setQuery(e.target.value)} rows={4} className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">Supports AND / OR / NOT and quoted phrases. Exclude tickers with -stock.</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <ChipGroup options={SOURCE_OPTIONS} selected={sources} onToggle={(v) => toggle(sources, v, setSources)} />
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Markets</Label>
                <ChipGroup options={MARKET_OPTIONS} selected={markets} onToggle={(v) => toggle(markets, v, setMarkets)} />
              </div>
              <div>
                <Label className="mb-3 block">Languages</Label>
                <ChipGroup options={LANG_OPTIONS} selected={languages} onToggle={(v) => toggle(languages, v, setLanguages)} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Negative-spike alert (%)</Label>
                <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Alert owner</Label>
                <Input value={owner} onChange={(e) => setOwner(e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{name}</dd></div>
              <div><dt className="text-muted-foreground">Sources</dt><dd className="font-medium">{sources.join(", ")}</dd></div>
              <div className="sm:col-span-2"><dt className="text-muted-foreground">Query</dt><dd className="font-mono text-xs">{query}</dd></div>
              <div><dt className="text-muted-foreground">Markets</dt><dd className="font-medium">{markets.join(", ")}</dd></div>
              <div><dt className="text-muted-foreground">Alert</dt><dd className="font-medium">{threshold}% spike → {owner}</dd></div>
            </dl>
          )}

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <Button variant="outline" onClick={() => (step === 0 ? navigate({ to: "/sentiment-analysis" }) : setStep(step - 1))}>
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <div className="flex gap-2">
              {step === STEPS.length - 1 ? (
                <>
                  <Button variant="outline" disabled={!name} onClick={() => handleFinish(false)}>Save draft</Button>
                  <Button disabled={!name || sources.length === 0} onClick={() => handleFinish(true)}>Activate listen</Button>
                </>
              ) : (
                <Button disabled={step === 0 && !name.trim()} onClick={() => setStep(step + 1)}>Continue</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChipGroup({
  options, selected, onToggle,
}: { options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
              active ? "border-primary bg-primary/10 font-medium" : "border-border text-muted-foreground",
            )}
          >
            <Checkbox checked={active} className="pointer-events-none size-3.5" />
            {option}
          </button>
        );
      })}
    </div>
  );
}
