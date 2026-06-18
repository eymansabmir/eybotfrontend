import { format } from "date-fns";
import { AlertCircle, Bot, CheckCheck, User } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { useRecipientConversation } from "../../../api/campaign-queries";
import type { ConversationMessage, RecipientConversation } from "../../../types";
import { RecipientStatusBadge } from "./recipient-status-badge";

function emptyReason(data: RecipientConversation): string {
    if (data.session) {
        return "This recipient's session has no recorded steps yet.";
    }
    switch (data.recipient.status) {
        case "pending":
            return "This recipient hasn't been sent yet — the campaign is still processing. Check back once their status moves to Sent/Delivered.";
        case "failed":
            return "This recipient failed before the flow started, so no chat session was created.";
        case "sent":
        case "delivered":
        case "read":
            return "The message was sent, but no flow session has been recorded for this recipient yet (it may still be flushing).";
        default:
            return "No chat session was found for this recipient.";
    }
}

interface RecipientConversationSheetProps {
    campaignId: string;
    recipientId: string | null;
    waId?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RecipientConversationSheet({
    campaignId,
    recipientId,
    waId,
    open,
    onOpenChange,
}: RecipientConversationSheetProps) {
    const { data, isLoading, isError } = useRecipientConversation(campaignId, open ? recipientId : null);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md p-0 gap-0">
                <SheetHeader className="border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                            {(waId ?? "?").slice(-2)}
                        </div>
                        <div className="min-w-0">
                            <SheetTitle className="truncate font-mono text-sm">{waId ?? data?.recipient.waId ?? "Recipient"}</SheetTitle>
                            <SheetDescription className="flex items-center gap-2">
                                {data?.recipient && <RecipientStatusBadge status={data.recipient.status} />}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
                    <div className="p-4 space-y-3">
                        {isLoading && (
                            <div className="space-y-3">
                                <Skeleton className="h-12 w-3/4 rounded-2xl" />
                                <Skeleton className="h-10 w-1/2 rounded-2xl ml-auto" />
                                <Skeleton className="h-16 w-2/3 rounded-2xl" />
                            </div>
                        )}

                        {isError && (
                            <div className="flex flex-col items-center justify-center text-center gap-2 py-12 text-muted-foreground">
                                <AlertCircle className="size-8" />
                                <p className="text-sm">Couldn't load this conversation.</p>
                            </div>
                        )}

                        {!isLoading && !isError && data && data.messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center text-center gap-2 py-12 text-muted-foreground">
                                <AlertCircle className="size-8" />
                                <p className="text-sm font-medium">No conversation to show</p>
                                <p className="text-xs max-w-[15rem]">{emptyReason(data)}</p>
                            </div>
                        )}

                        {!isLoading && !isError && data?.messages.map((msg, idx) => (
                            <MessageBubble key={`${msg.nodeId}-${idx}`} msg={msg} />
                        ))}
                    </div>
                </ScrollArea>

                {data?.reconstructed && data.messages.length > 0 && (
                    <div className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground bg-muted/20">
                        Reconstructed from flow steps — outbound text is an approximation of what was sent.
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function MessageBubble({ msg }: { msg: ConversationMessage }) {
    const isOutbound = msg.direction === "outbound";
    const time = (() => {
        try {
            return format(new Date(msg.at), "MMM dd, hh:mm a");
        } catch {
            return "";
        }
    })();

    return (
        <div className={`flex ${isOutbound ? "justify-start" : "justify-end"}`}>
            <div className={`flex gap-2 max-w-[85%] ${isOutbound ? "flex-row" : "flex-row-reverse"}`}>
                <div
                    className={`size-7 shrink-0 rounded-full flex items-center justify-center ${
                        isOutbound ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                >
                    {isOutbound ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
                </div>
                <div
                    className={`rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                        isOutbound
                            ? "bg-card border border-border rounded-tl-sm"
                            : "bg-emerald-500 text-white rounded-tr-sm"
                    }`}
                >
                    {msg.kind === "media" && msg.mediaUrl && (
                        <div className="mb-1 text-xs italic opacity-80 break-all">📎 {msg.mediaUrl}</div>
                    )}
                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                    {msg.caption && <p className="mt-1 text-xs opacity-80 break-words">{msg.caption}</p>}
                    {msg.options && msg.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.options.map((opt, i) => (
                                <span
                                    key={i}
                                    className={`text-xs px-2 py-0.5 rounded-full border ${
                                        isOutbound ? "border-border bg-muted/50" : "border-white/40 bg-white/10"
                                    }`}
                                >
                                    {opt}
                                </span>
                            ))}
                        </div>
                    )}
                    <div className={`mt-1 flex items-center gap-1 text-[10px] ${isOutbound ? "text-muted-foreground" : "text-white/70"}`}>
                        {time}
                        {!isOutbound && <CheckCheck className="size-3" />}
                    </div>
                </div>
            </div>
        </div>
    );
}
