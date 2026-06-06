import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useBots } from "@/features/bots/data/queries/use-bots";
import { Loader2 } from "lucide-react";

interface CampaignDetailsStepProps {
    title: string;
    onTitleChange: (val: string) => void;
    botId: string;
    onBotIdChange: (val: string) => void;
    isRerunMode?: boolean;
}

export function CampaignDetailsStep({
    title,
    onTitleChange,
    botId,
    onBotIdChange,
    isRerunMode = false,
}: CampaignDetailsStepProps) {
    const { data: bots, isLoading, isError } = useBots();
    const publishedBots = bots?.filter((b) => b.status === "published") ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Campaign details</h3>
                <p className="text-sm text-muted-foreground">
                    Basic information about your campaign.
                </p>
            </div>

            <div className="space-y-4">
                {/* Campaign Name */}
                <div className="space-y-2">
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input
                        id="campaign-name"
                        placeholder="e.g. Q4 Customer Outreach"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        disabled={isRerunMode}
                        autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                        Use a descriptive name to easily identify this campaign later.
                    </p>
                </div>

                {/* Bot Selector */}
                <div className="space-y-2">
                    <Label htmlFor="bot-select">Select Bot</Label>
                    {isLoading ? (
                        <div className="flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            Loading bots...
                        </div>
                    ) : isError ? (
                        <p className="text-sm text-destructive">Failed to load bots. Please try again.</p>
                    ) : publishedBots.length === 0 ? (
                        <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 p-3">
                            <span className="text-amber-600 dark:text-amber-400 text-sm">⚠</span>
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                No published bots found. Please publish a bot first before creating a campaign.
                            </p>
                        </div>
                    ) : (
                        <Select value={botId} onValueChange={onBotIdChange} disabled={isRerunMode}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a published bot" />
                            </SelectTrigger>
                            <SelectContent>
                                {publishedBots.map((bot) => (
                                    <SelectItem key={bot.id} value={bot.id}>
                                        {bot.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 p-3">
                        <span className="text-blue-600 dark:text-blue-400 text-sm">ℹ</span>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            Only <strong>published</strong> bots can be selected for campaigns.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
