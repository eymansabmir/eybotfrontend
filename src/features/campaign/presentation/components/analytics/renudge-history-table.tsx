import { format } from "date-fns";
import { Repeat } from "lucide-react";
import { useCampaignRenudges } from "../../../api/campaign-queries";
import { Badge } from "@/components/ui/badge";

export function RenudgeHistoryTable({ campaignId }: { campaignId: string }) {
    const { data: renudges, isLoading } = useCampaignRenudges(campaignId);

    if (isLoading) return null;
    if (!renudges || renudges.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
                <Repeat className="size-5 text-primary" />
                Follow-up Renudges
            </h3>
            
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 font-medium">Scheduled For</th>
                            <th className="px-4 py-3 font-medium">Bot Flow</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Delivery Stats</th>
                            <th className="px-4 py-3 font-medium">Positive / Negative Responses</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {renudges.map((renudge) => (
                            <tr key={renudge.id} className="hover:bg-muted/10 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    {format(new Date(renudge.scheduledAt), "MMM d, yyyy h:mm a")}
                                </td>
                                <td className="px-4 py-3">
                                    {renudge.bot?.name || "Unknown Bot"}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge 
                                        variant={renudge.status === 'pending' ? 'secondary' : 'default'} 
                                        className={`capitalize ${renudge.status === 'completed' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                                    >
                                        {renudge.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted-foreground">Sent: <span className="text-foreground">{renudge.sentCount.toLocaleString()}</span></span>
                                        <span className="text-rose-500">Failed: {renudge.failedCount?.toLocaleString() || 0}</span>
                                        <span className="text-emerald-500">Delivered: {renudge.deliveredCount.toLocaleString()}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3 font-mono">
                                        <span className="text-emerald-500">{renudge.yesCount.toLocaleString()} Yes</span>
                                        <span className="text-rose-500">{renudge.noCount.toLocaleString()} No</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
