import { AlertCircle, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CampaignConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ruleName: string;
  matchCount: number;
  onConfirm: (triggerCampaign: boolean) => void;
  isPending: boolean;
}

export function CampaignConfirmationDialog({
  open,
  onOpenChange,
  ruleName,
  matchCount,
  onConfirm,
  isPending
}: CampaignConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] max-h-[85vh] overflow-y-auto vt-scrollbar">
        <DialogHeader>
          <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
             <Play className="size-6 ml-0.5" />
          </div>
          <DialogTitle>Activate Rule & Start Campaign?</DialogTitle>
          <DialogDescription className="text-xs pt-2">
            <span className="font-semibold">Rule:</span> {ruleName} <br />
            This rule matches <span className="font-bold text-foreground">{matchCount} entities</span> in your current dataset. 
            Activating it will initiate outbound calls for all matching records.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-amber-800">
           <AlertCircle className="size-5 shrink-0" />
           <p className="text-[11px] leading-relaxed">
              <strong>Cost Warning:</strong> This will trigger real-world API calls via your configured voice provider. Ensure you have sufficient credits.
           </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onConfirm(false)}
            disabled={isPending}
            className="flex-1 text-xs font-bold"
          >
            Just Activate (No Calls)
          </Button>
          <Button 
            onClick={() => onConfirm(true)}
            disabled={isPending}
            className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
          >
            Activate & Start Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
