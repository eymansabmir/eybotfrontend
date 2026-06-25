import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, MessageSquareText, Users } from "lucide-react";

import { useCampaignRecipients } from "../../../api/campaign-queries";
import type { CampaignRecipient, RecipientStatus } from "../../../types";
import { RecipientStatusBadge } from "./recipient-status-badge";
import { RecipientConversationSheet } from "./recipient-conversation-sheet";

const PAGE_SIZE = 25;

const STATUS_FILTERS: { value: string; label: string }[] = [
    { value: "", label: "All" },
    { value: "replied", label: "Replied" },
    { value: "completed", label: "Completed" },
    { value: "read", label: "Read" },
    { value: "delivered", label: "Delivered" },
    { value: "sent", label: "Sent" },
    { value: "failed", label: "Failed" },
    { value: "pending", label: "Pending" },
];

interface CampaignRecipientsTableProps {
    campaignId: string;
    versionId?: string;
    startDate?: string;
    endDate?: string;
}

export function CampaignRecipientsTable({
    campaignId,
    versionId,
    startDate,
    endDate,
}: CampaignRecipientsTableProps) {
    const [statusFilter, setStatusFilter] = useState("");
    // Cursor stack so we can paginate forwards and backwards through the keyset.
    const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([undefined]);
    const [selected, setSelected] = useState<CampaignRecipient | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const currentCursor = cursorStack[cursorStack.length - 1];

    const { data, isLoading, isFetching } = useCampaignRecipients(campaignId, {
        limit: PAGE_SIZE,
        ...(currentCursor ? { cursor: currentCursor } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(versionId ? { versionId } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
    });

    const recipients = data?.recipients ?? [];
    const pageIndex = cursorStack.length - 1;

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        setCursorStack([undefined]);
    };

    const handleOpenConversation = (recipient: CampaignRecipient) => {
        setSelected(recipient);
        setSheetOpen(true);
    };

    if (isLoading && recipients.length === 0) {
        return <div className="animate-pulse h-64 bg-muted rounded-2xl border border-border shadow-sm" />;
    }

    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Users className="size-5 text-primary" />
                        Recipients & Conversations
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Inspect each recipient's status and reconstructed chat from this campaign.
                    </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.value || "all"}
                            onClick={() => handleFilterChange(f.value)}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                statusFilter === f.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:bg-muted"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">Recipient</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Activity</th>
                            <th className="px-6 py-4 text-right">Conversation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {recipients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                    No recipients found{statusFilter ? ` with status "${statusFilter}"` : ""}.
                                </td>
                            </tr>
                        )}
                        {recipients.map((r) => (
                            <tr
                                key={r.id}
                                className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                onClick={() => handleOpenConversation(r)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-foreground">{r.waId}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <RecipientStatusBadge status={r.status as RecipientStatus} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-muted-foreground text-xs">
                                    {lastActivity(r)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                                        <MessageSquareText className="size-4" />
                                        View chat
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
                <span className="text-sm text-muted-foreground">
                    {typeof data?.total === "number" && (
                        <>
                            <span className="font-medium text-foreground">{data.total.toLocaleString()}</span> total recipients
                        </>
                    )}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Page {pageIndex + 1}</span>
                    <button
                        onClick={() => setCursorStack((s) => (s.length > 1 ? s.slice(0, -1) : s))}
                        disabled={pageIndex === 0 || isFetching}
                        className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        onClick={() => data?.nextCursor && setCursorStack((s) => [...s, data.nextCursor!])}
                        disabled={!data?.nextCursor || isFetching}
                        className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                </div>
            </div>

            <RecipientConversationSheet
                campaignId={campaignId}
                recipientId={selected?.id ?? null}
                {...(selected?.waId ? { waId: selected.waId } : {})}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}

function lastActivity(r: CampaignRecipient): string {
    const ts = r.repliedAt ?? r.readAt ?? r.deliveredAt ?? r.sentAt ?? r.createdAt;
    if (!ts) return "-";
    try {
        return format(new Date(ts), "MMM dd, yyyy hh:mm a");
    } catch {
        return "-";
    }
}
