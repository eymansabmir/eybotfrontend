import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Bot, Calendar, Clock, Loader2, Moon, Users, Play } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useBots, useBot } from "@/features/bots/data/queries/use-bots";
import { useCampaignAnalytics } from "../../api/campaign-queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { Campaign } from "../../types";

interface LaunchRenudgeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    campaign: Campaign | null;
}

interface RenudgeFormData {
    botId: string;
    scheduledAt: string;
    scheduledTime: string;
    staggerHours: number;
    useQuietHours: boolean;
    quietHourStart: string;
    quietHourEnd: string;
    positiveButtonId: string;
    negativeButtonId: string;
}

export function LaunchRenudgeSheet({ open, onOpenChange, campaign }: LaunchRenudgeSheetProps) {
    const queryClient = useQueryClient();
    const { data: bots = [] } = useBots();
    const { data: stats } = useCampaignAnalytics(campaign?.id);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, watch, reset } = useForm<RenudgeFormData>({
        defaultValues: {
            botId: "",
            scheduledAt: format(new Date(), "yyyy-MM-dd"),
            scheduledTime: format(new Date(Date.now() + 15 * 60000), "HH:mm"),
            staggerHours: 0,
            useQuietHours: false,
            quietHourStart: "22:00",
            quietHourEnd: "08:00",
            positiveButtonId: "",
            negativeButtonId: "",
        }
    });

    const selectedBotId = watch("botId");
    const { data: selectedBot } = useBot(selectedBotId);

    // Extract interactive buttons from the bot's nodes
    const availableButtons = useMemo(() => {
        if (!selectedBot?.nodes) return [];
        const btns: { id: string; title: string }[] = [];
        
        selectedBot.nodes.forEach((node: any) => {
            if (node.data?.buttons && Array.isArray(node.data.buttons)) {
                btns.push(...node.data.buttons);
            }
        });
        
        return btns;
    }, [selectedBot]);

    // Auto-select first two buttons if available
    useEffect(() => {
        if (availableButtons.length >= 2) {
            reset((prev) => ({
                ...prev,
                positiveButtonId: availableButtons[0].id,
                negativeButtonId: availableButtons[1].id
            }));
        } else if (availableButtons.length === 1) {
             reset((prev) => ({
                ...prev,
                positiveButtonId: availableButtons[0].id
            }));
        }
    }, [availableButtons, reset]);

    const useQuietHours = watch("useQuietHours");
    const staggerHours = watch("staggerHours");

    const launchMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiClient.post(`/campaigns/${campaign?.id}/renudge`, data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Renudge campaign launched successfully");
            queryClient.invalidateQueries({ queryKey: ["campaigns"] });
            queryClient.invalidateQueries({ queryKey: ["campaign-renudges", campaign?.id] });
            reset();
            onOpenChange(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.error || "Failed to launch renudge");
        }
    });

    const onSubmit = (data: RenudgeFormData) => {
        setIsSubmitting(true);
        const datetime = new Date(`${data.scheduledAt}T${data.scheduledTime}`);
        
        launchMutation.mutate({
            botId: data.botId,
            scheduledAt: datetime.toISOString(),
            staggerHours: data.staggerHours,
            quietHourStart: data.useQuietHours ? data.quietHourStart : null,
            quietHourEnd: data.useQuietHours ? data.quietHourEnd : null,
            positiveButtonId: data.positiveButtonId,
            negativeButtonId: data.negativeButtonId,
        }, {
            onSettled: () => setIsSubmitting(false)
        });
    };

    if (!campaign) return null;

    const availableRecipients = stats?.analytics?.total || 0;
    const targetAudience = availableRecipients;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[1000px] p-0 border-l border-border shadow-2xl flex flex-col h-full bg-background">
                {/* Header Section */}
                <div className="flex items-start justify-between p-8 border-b border-border bg-card/50">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                            Campaign › {campaign.name}
                        </p>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-foreground">
                            Launch Follow-up Tracker
                        </SheetTitle>
                        <SheetDescription className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[450px]">
                            Schedule a secondary bot flow to ping users and track if they have completed their required tasks.
                        </SheetDescription>
                    </div>
                </div>

                {/* Info Bar */}
                <div className="flex items-center gap-4 px-8 py-4 bg-primary/5 border-b border-primary/10">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <Users className="size-5 text-primary" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/80">
                            Target Audience
                        </p>
                        <p className="text-sm text-foreground font-bold flex items-center gap-2">
                            {targetAudience.toLocaleString()} available recipients
                            <span className="px-2 py-0.5 rounded-full bg-background/50 text-[10px] uppercase tracking-wider text-muted-foreground border border-border/50">
                                100% Coverage
                            </span>
                        </p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <form id="renudge-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        
                        {/* Left Column: Bot Configuration */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-muted-foreground border-b border-border/50 pb-3 flex items-center gap-2">
                                    <Bot className="size-4" /> 1. Bot Configuration
                                </h3>
                                
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold">Select Follow-up Bot</Label>
                                    <p className="text-xs text-muted-foreground/80 mb-2">Choose the flow that asks users about their task completion.</p>
                                    <Controller
                                        name="botId"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className="h-12 bg-muted/30 border-border/50 rounded-xl font-medium shadow-sm transition-all hover:bg-muted/50 focus:ring-primary/20">
                                                    <SelectValue placeholder="Choose a flow..." />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-border/50 shadow-xl">
                                                    {bots.map((f: any) => (
                                                        <SelectItem key={f.id} value={f.id} className="font-medium cursor-pointer py-3">{f.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-5 p-5 rounded-2xl bg-muted/20 border border-border/40">
                                    <div className="space-y-2.5">
                                        <Label className="text-xs font-bold text-muted-foreground">Positive Intent Button ID</Label>
                                        <Controller
                                            name="positiveButtonId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full h-10 bg-background border-border/50 rounded-lg shadow-sm font-mono text-xs overflow-hidden">
                                                        <div className="truncate pr-2">
                                                            <SelectValue placeholder="Auto-detected..." />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableButtons.length > 0 ? availableButtons.map((btn) => (
                                                            <SelectItem key={btn.id} value={btn.id}>
                                                                <span className="truncate block max-w-[300px] sm:max-w-[400px]">{btn.title} ({btn.id})</span>
                                                            </SelectItem>
                                                        )) : <SelectItem value="none" disabled>No buttons found</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-xs font-bold text-muted-foreground">Negative Intent Button ID</Label>
                                        <Controller
                                            name="negativeButtonId"
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full h-10 bg-background border-border/50 rounded-lg shadow-sm font-mono text-xs overflow-hidden">
                                                        <div className="truncate pr-2">
                                                            <SelectValue placeholder="Auto-detected..." />
                                                        </div>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableButtons.length > 0 ? availableButtons.map((btn) => (
                                                            <SelectItem key={btn.id} value={btn.id}>
                                                                <span className="truncate block max-w-[300px] sm:max-w-[400px]">{btn.title} ({btn.id})</span>
                                                            </SelectItem>
                                                        )) : <SelectItem value="none" disabled>No buttons found</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Scheduling */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-muted-foreground border-b border-border/50 pb-3 flex items-center gap-2">
                                    <Calendar className="size-4" /> 2. Delivery Schedule
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold">Launch Date</Label>
                                        <Controller
                                            name="scheduledAt"
                                            control={control}
                                            render={({ field }) => <Input type="date" {...field} className="h-12 bg-muted/30 border-border/50 rounded-xl font-medium shadow-sm transition-all focus:ring-primary/20" />}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold flex items-center gap-2">
                                            <Clock className="size-3.5 text-muted-foreground" /> Launch Time
                                        </Label>
                                        <Controller
                                            name="scheduledTime"
                                            control={control}
                                            render={({ field }) => <Input type="time" {...field} className="h-12 bg-muted/30 border-border/50 rounded-xl font-medium shadow-sm transition-all focus:ring-primary/20" />}
                                        />
                                    </div>
                                </div>

                                {/* Staggering */}
                                <div className="space-y-5 p-6 rounded-2xl bg-muted/20 border border-border/40">
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold">Stagger Delivery</Label>
                                            <p className="text-xs text-muted-foreground">Distribute messages over time to prevent rate limits.</p>
                                        </div>
                                        <span className="text-sm font-bold bg-background px-3 py-1 rounded-lg border border-border/50 shadow-sm">
                                            {staggerHours === 0 ? "Immediate" : `${staggerHours} Hours`}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <Controller
                                            name="staggerHours"
                                            control={control}
                                            render={({ field }) => (
                                                <Slider
                                                    value={[field.value]}
                                                    onValueChange={([val]) => field.onChange(val)}
                                                    max={24}
                                                    step={1}
                                                    className="py-2"
                                                />
                                            )}
                                        />
                                    </div>
                                    {staggerHours > 0 && targetAudience > 0 && (
                                        <div className="bg-primary/5 text-primary text-xs font-semibold px-4 py-2.5 rounded-lg border border-primary/10 flex items-center gap-2">
                                            <Loader2 className="size-3.5 animate-spin" />
                                            ~{Math.round(targetAudience / staggerHours).toLocaleString()} messages will be sent per hour.
                                        </div>
                                    )}
                                </div>

                                {/* Quiet Hours */}
                                <div className="space-y-5 p-6 rounded-2xl border border-border/40 transition-colors data-[active=true]:bg-muted/20 data-[active=true]:border-primary/20" data-active={useQuietHours}>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="flex items-center gap-2 text-sm font-bold">
                                                <Moon className="size-4 text-muted-foreground" />
                                                Respect Quiet Hours
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Automatically pause delivery during night time.</p>
                                        </div>
                                        <Controller
                                            name="useQuietHours"
                                            control={control}
                                            render={({ field }) => (
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            )}
                                        />
                                    </div>

                                    {useQuietHours && (
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-muted-foreground">Start Time</Label>
                                                <Controller
                                                    name="quietHourStart"
                                                    control={control}
                                                    render={({ field }) => <Input type="time" {...field} className="h-10 bg-background border-border/50 rounded-lg shadow-sm" />}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-muted-foreground">End Time</Label>
                                                <Controller
                                                    name="quietHourEnd"
                                                    control={control}
                                                    render={({ field }) => <Input type="time" {...field} className="h-10 bg-background border-border/50 rounded-lg shadow-sm" />}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer / Action Bar */}
                <div className="p-6 border-t border-border bg-muted/5 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium hidden sm:block">
                        Please review configuration before launching.
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => onOpenChange(false)} 
                            className="h-11 px-6 rounded-xl font-bold text-muted-foreground hover:bg-muted/50 transition-colors w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            form="renudge-form"
                            disabled={isSubmitting || !watch("botId")}
                            className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : <Play className="size-4 mr-2 fill-current" />}
                            Launch Follow-up Campaign
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
