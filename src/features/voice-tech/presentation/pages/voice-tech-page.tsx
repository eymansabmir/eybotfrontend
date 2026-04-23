import { Link } from "@tanstack/react-router";
import {
  Database,
  GitBranch,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Upload,
  Plus,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEntityTypes, useRoutingConfigs } from "../../api/voice-tech-queries";

const TENANT_ID = "tenant-ey-001";

const STEPS = [
  {
    number: 1,
    title: "Upload Datasets",
    description: "Import your CSV data to power routing rules. Each dataset becomes a source for call orchestration.",
    icon: Database,
    href: "/voice-tech/datasets",
    cta: "Manage Datasets",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    number: 2,
    title: "Configure Routing",
    description: "Create routing groups and define rules that decide which voice provider handles each call.",
    icon: GitBranch,
    href: "/voice-tech/routings",
    cta: "Manage Routing",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
  },
  {
    number: 3,
    title: "Execute Calls",
    description: "Select your datasets and routing group, then trigger bulk call execution with real-time progress.",
    icon: Zap,
    href: "/voice-tech/execute",
    cta: "Launch Execution",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
  },
];

export function VoiceTechPage() {
  const { data: entityTypes = [], isLoading: datasetsLoading } = useEntityTypes(TENANT_ID);
  const { data: configs = [], isLoading: configsLoading } = useRoutingConfigs(TENANT_ID);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
            <Activity className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Voice Orchestration
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload data, configure routing rules, and execute calls — step by step.
            </p>
          </div>
        </div>
      </div>

      {/* ── Step Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <Link key={step.number} to={step.href} className="group focus-visible:outline-none">
              <Card className="h-full border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden">
                {/* Step indicator bar */}
                <div className={`h-1 w-full ${step.number === 1 ? "bg-blue-500" : step.number === 2 ? "bg-violet-500" : "bg-emerald-500"}`} />

                <CardContent className="p-6 space-y-4">
                  {/* Step number + icon */}
                  <div className="flex items-center justify-between">
                    <div className={`size-12 rounded-xl ${step.iconBg} flex items-center justify-center`}>
                      <Icon className={`size-6 ${step.iconColor}`} />
                    </div>
                    <Badge variant="outline" className="text-xs font-bold tabular-nums">
                      Step {step.number}
                    </Badge>
                  </div>

                  {/* Title + description */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Stats row */}
                  <div className="pt-2">
                    {step.number === 1 && (
                      datasetsLoading ? (
                        <Skeleton className="h-5 w-24 rounded" />
                      ) : (
                        <p className="text-xs font-medium text-muted-foreground">
                          <span className="text-foreground font-bold">{entityTypes.length}</span> datasets uploaded
                        </p>
                      )
                    )}
                    {step.number === 2 && (
                      configsLoading ? (
                        <Skeleton className="h-5 w-28 rounded" />
                      ) : (
                        <p className="text-xs font-medium text-muted-foreground">
                          <span className="text-foreground font-bold">{configs.length}</span> routing groups created
                        </p>
                      )
                    )}
                    {step.number === 3 && (
                      <p className="text-xs font-medium text-muted-foreground">
                        Ready when datasets and routing are configured
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {step.cta}
                    <ArrowRight className="size-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link to="/voice-tech/datasets">
          <Button variant="outline" className="gap-2 h-10">
            <Upload className="size-4" />
            Upload Dataset
          </Button>
        </Link>
        <Link to="/voice-tech/routings">
          <Button variant="outline" className="gap-2 h-10">
            <Plus className="size-4" />
            Create Routing Group
          </Button>
        </Link>
        <Link to="/voice-tech/execute">
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90">
            <Zap className="size-4" />
            Execute Calls
          </Button>
        </Link>
      </div>

      {/* ── Getting Started Guide ──────────────────────────── */}
      <Card className="border-dashed border-2 border-border/60 bg-muted/20">
        <CardContent className="p-6">
          <h3 className="text-base font-bold mb-4">Getting Started</h3>
          <div className="space-y-3">
            <Step
              done={entityTypes.length > 0}
              label="Upload at least one dataset with phone numbers and attributes"
            />
            <Step
              done={configs.length > 0}
              label="Create a routing group and add rules to define call logic"
            />
            <Step
              done={false}
              label="Execute your first call campaign from the Execute page"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3">
      {done ? (
        <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
      ) : (
        <div className="size-5 rounded-full border-2 border-border shrink-0" />
      )}
      <span className={`text-sm ${done ? "text-muted-foreground line-through" : "text-foreground font-medium"}`}>
        {label}
      </span>
    </div>
  );
}
