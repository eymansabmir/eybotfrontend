import { RateCard } from "@/features/campaign/presentation/components/analytics/metric-card";
import { ConversionFunnel } from "@/features/campaign/presentation/components/analytics/conversion-funnel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CampaignStatusBadge } from "./campaign-status-badge";
import type { CampaignStatus } from "../../../types";
import { toast } from "sonner";

interface CampaignDetailHeaderProps {
  name: string;
  status: CampaignStatus;
  subtitle?: string;
  backTo: string;
}

export function CampaignDetailHeader({
  name,
  status,
  subtitle,
  backTo,
}: CampaignDetailHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border/50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-background/50 hover:bg-background shadow-sm"
          onClick={() => navigate({ to: backTo })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-foreground tracking-tight">{name}</h1>
            <CampaignStatusBadge status={status} />
          </div>
          {subtitle ? (
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <Button
        variant="outline"
        className="gap-2 rounded-xl border-dashed"
        onClick={() => toast.info("Export is available in the full release — roadmap preview only.")}
      >
        <Download className="size-4" />
        Download Report
      </Button>
    </div>
  );
}

export { RateCard, ConversionFunnel, Card, CardContent, CardDescription, CardHeader, CardTitle };
