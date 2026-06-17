import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCampaigns } from "../../api/campaign-queries";
import { CampaignTable } from "../components/campaign-table";
import { CreateCampaignDialog } from "../components/create-campaign-dialog";
import { LaunchRenudgeSheet } from "../components/launch-renudge-sheet";

import type { Campaign } from "../../types";

export function CampaignPage() {
  const { data: campaigns, isLoading } = useCampaigns();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rerunCampaign, setRerunCampaign] = useState<Campaign | null>(null);
  const [renudgeCampaign, setRenudgeCampaign] = useState<Campaign | null>(null);
  const [renudgeSheetOpen, setRenudgeSheetOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Campaign
          </p>
          <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
        </div>
        <Button onClick={() => { setRerunCampaign(null); setDialogOpen(true); }} className="gap-2">
          <Plus className="size-4" />
          Create Campaign
        </Button>
      </div>

      {/* Table */}
      <CampaignTable 
        campaigns={campaigns} 
        isLoading={isLoading} 
        onRerunCampaign={(c) => {
          setRerunCampaign(c);
          setDialogOpen(true);
        }}
        onLaunchRenudge={(c) => {
          setRenudgeCampaign(c);
          setRenudgeSheetOpen(true);
        }}
      />

      {/* Create Dialog */}
      <CreateCampaignDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setRerunCampaign(null);
          setDialogOpen(open);
        }}
        initialCampaign={rerunCampaign}
      />

      {/* Renudge Sheet */}
      <LaunchRenudgeSheet
        open={renudgeSheetOpen}
        onOpenChange={(open) => {
          if (!open) setRenudgeCampaign(null);
          setRenudgeSheetOpen(open);
        }}
        campaign={renudgeCampaign}
      />
    </div>
  );
}
