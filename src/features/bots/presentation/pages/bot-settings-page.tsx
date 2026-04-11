import { useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useBot, useUpdateBot, usePublishBot, useArchiveBot } from "../../data/queries/use-bots";
import { toast } from "sonner";
import { Loader2, Settings, Languages, MessageSquare, Bot, Trash2, Info, Plus, ExternalLink, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { WhatsAppCredentialsDialog } from "@/features/integrations/whatsapp/presentation/whatsapp-credentials-dialog";
import { useWhatsAppCredentials, useDeleteWhatsAppCredential } from "@/features/integrations/whatsapp/hooks/use-whatsapp-credentials";
import { LocalizationForm } from "@/features/settings/presentation/components/localization-form";
import { BotEditorNavbar } from "../components/bot-editor-navbar";

type ApiLikeError = {
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
};

type LocalizationSettings = {
    isEnabled: boolean;
    languages: string[];
    defaultLanguage?: string;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
    const candidate = error as ApiLikeError;
    return candidate?.response?.data?.message || candidate?.message || fallback;
};

export function BotSettingsPage() {
    const { id } = useParams({ from: "/bot/$id/settings" });
    const { data: bot, isLoading } = useBot(id);
    const updateBotMutation = useUpdateBot(id);
    const publishBotMutation = usePublishBot();
    const archiveBotMutation = useArchiveBot();

    const [activeTab, setActiveTab] = useState("whatsapp");

    // Data Hooks
    const { data: credentials = [] } = useWhatsAppCredentials(bot?.orgId || "");

    // Setup Modals & States
    const [isCredentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
    const deleteMutation = useDeleteWhatsAppCredential(bot?.orgId || "");
    
    // Dynamic Form States
    const [selectedCredentialId, setSelectedCredentialId] = useState<string>("");
    const [timeoutSeconds, setTimeoutSeconds] = useState(4); 
    const [startConditionEnabled, setStartConditionEnabled] = useState(false);
    const [comparisons, setComparisons] = useState([{ operator: "CONTAINS", value: "" }]);
    const [logicalOperator, setLogicalOperator] = useState("AND");

    // Keep latest UI values in refs so save payload never uses stale state.
    const selectedCredentialIdRef = useRef<string>("");
    const timeoutSecondsRef = useRef<number>(4);
    const startConditionEnabledRef = useRef<boolean>(false);
    const comparisonsRef = useRef([{ operator: "CONTAINS", value: "" }]);
    const logicalOperatorRef = useRef("AND");

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");

    const getCredentialStorageKey = (botId: string) => `bot:${botId}:selected-whatsapp-credential`;

    const getCachedCredentialId = (botId: string): string | null => {
        if (typeof window === "undefined") return null;
        return window.localStorage.getItem(getCredentialStorageKey(botId));
    };

    const setCachedCredentialId = (botId: string, credentialId: string) => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(getCredentialStorageKey(botId), credentialId);
    };

    const setSelectedCredentialIdSync = (value: string) => {
        selectedCredentialIdRef.current = value;
        setSelectedCredentialId(value);
    };

    const setTimeoutSecondsSync = (value: number) => {
        timeoutSecondsRef.current = value;
        setTimeoutSeconds(value);
    };

    const setStartConditionEnabledSync = (value: boolean) => {
        startConditionEnabledRef.current = value;
        setStartConditionEnabled(value);
    };

    const setComparisonsSync = (value: Array<{ operator: string; value: string }>) => {
        comparisonsRef.current = value;
        setComparisons(value);
    };

    const setLogicalOperatorSync = (value: string) => {
        logicalOperatorRef.current = value;
        setLogicalOperator(value);
    };

    // Initialize local state from Bot on load
    useEffect(() => {
        if (bot) {
            const hours = (bot.settings?.timeoutSeconds || 14400) / 3600;
            setTimeoutSecondsSync(Math.max(1, hours));
            setTempName(bot.name || "");

            const triggerDisabled = bot.triggerConfig?.enabled === false;

            // Always rehydrate toggle and conditions from persisted triggerConfig.
            if (triggerDisabled) {
                setStartConditionEnabledSync(false);
                setComparisonsSync([{ operator: "CONTAINS", value: "" }]);
                setLogicalOperatorSync("AND");
            } else if (bot.triggerConfig?.comparisons && bot.triggerConfig.comparisons.length > 0) {
                setStartConditionEnabledSync(true);
                setComparisonsSync(bot.triggerConfig.comparisons);
                setLogicalOperatorSync(bot.triggerConfig.logicalOperator || "AND");
            } else if (bot.triggerConfig?.keywords && bot.triggerConfig.keywords.length > 0) {
                setStartConditionEnabledSync(true);
                setComparisonsSync(bot.triggerConfig.keywords.map(k => ({ operator: "EQUALS", value: k })));
                setLogicalOperatorSync(bot.triggerConfig.logicalOperator || "AND");
            } else {
                setStartConditionEnabledSync(false);
                setComparisonsSync([{ operator: "CONTAINS", value: "" }]);
                setLogicalOperatorSync("AND");
            }

            if (bot.settings?.credentialId) {
                setSelectedCredentialIdSync(bot.settings.credentialId);
            } else {
                setSelectedCredentialIdSync(getCachedCredentialId(bot.id) || "");
            }
        }
    }, [bot]);

    // Reconcile selected account with available credentials so previous configuration
    // is auto-selected after refresh/navigation without requiring manual re-selection.
    useEffect(() => {
        if (!bot) return;
        if (credentials.length === 0) return;

        const configuredCredentialId = bot.settings?.credentialId;
        const cachedCredentialId = getCachedCredentialId(bot.id);

        const hasCredential = (id: string | undefined) =>
            Boolean(id) && credentials.some((c) => c.id === id);

        if (hasCredential(configuredCredentialId) && selectedCredentialId !== configuredCredentialId) {
            setSelectedCredentialIdSync(configuredCredentialId!);
            return;
        }

        if (selectedCredentialId && hasCredential(selectedCredentialId)) {
            return;
        }

        if (hasCredential(cachedCredentialId || undefined)) {
            setSelectedCredentialIdSync(cachedCredentialId!);
            return;
        }

        if (credentials.length === 1) {
            setSelectedCredentialIdSync(credentials[0]!.id);
        }
    }, [bot, credentials, selectedCredentialId]);

    useEffect(() => {
        if (!bot) return;
        if (!selectedCredentialId || selectedCredentialId === "CONNECT_NEW") return;
        setCachedCredentialId(bot.id, selectedCredentialId);
    }, [bot, selectedCredentialId]);

    const handleInlineRename = async () => {
        if (!tempName.trim() || tempName === bot?.name) {
            setIsEditingName(false);
            return;
        }

        try {
            await updateBotMutation.mutateAsync({ name: tempName });
            toast.success("Bot renamed successfully!");
            setIsEditingName(false);
        } catch (error) {
            toast.error("Failed to rename bot.");
            setTempName(bot?.name || "");
            setIsEditingName(false);
        }
    };

    const handleSaveAndPublish = async () => {
        try {
            const credentialId = selectedCredentialIdRef.current;
            const timeout = timeoutSecondsRef.current;
            const isStartConditionEnabled = startConditionEnabledRef.current;
            const latestComparisons = comparisonsRef.current;
            const latestLogicalOperator = logicalOperatorRef.current as "AND" | "OR";

            await updateBotMutation.mutateAsync({
                settings: {
                    ...(bot?.settings || {}),
                    maxSteps: bot?.settings?.maxSteps || 100,
                    timeoutSeconds: timeout * 3600,
                    credentialId,
                },
                triggerConfig: isStartConditionEnabled
                    ? {
                                                enabled: true,
                        logicalOperator: latestLogicalOperator,
                        comparisons: latestComparisons
                            .map(c => ({ ...c, value: (c.value || "").trim() }))
                            .filter(c => c.value.length > 0),
                      }
                    : {
                                                enabled: false,
                        logicalOperator: "OR",
                        comparisons: [],
                        keywords: [],
                      },
                isConfigured: true
            });
            
            publishBotMutation.mutate(id, {
                onSuccess: () => toast.success("Bot published successfully!"),
                onError: (err: unknown) => {
                    toast.error(getErrorMessage(err, "Failed to publish bot"));
                }
            });
        } catch (error) {
            toast.error("Failed to save and publish.");
        }
    };

    const handleTimeoutChange = (delta: number) => {
        const next = Math.max(0, Math.min(48, timeoutSecondsRef.current + delta));
        setTimeoutSecondsSync(next);
    };

    const addComparison = () => {
        setComparisonsSync([...comparisonsRef.current, { operator: "CONTAINS", value: "" }]);
    };

    const updateComparison = (index: number, key: string, val: string) => {
        const newComps = [...comparisonsRef.current];
        newComps[index] = { ...newComps[index], [key]: val };
        setComparisonsSync(newComps);
    };

    const removeComparison = (index: number) => {
        setComparisonsSync(comparisonsRef.current.filter((_, i) => i !== index));
    };

    const handleLocalizationChange = async (localization: LocalizationSettings) => {
        try {
             await updateBotMutation.mutateAsync({
                settings: {
                     timeoutSeconds: 14400,
                     maxSteps: 100,
                     ...bot?.settings,
                     localization,
                },
             });
             toast.success("Localization settings saved.");
        } catch (err) {
             toast.error("Failed to save localization settings.");
        }
    };

    if (isLoading || !bot) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const navigationItems = [
         { id: "general", label: "General", icon: Settings, description: "Basic bot configuration" },
         { id: "whatsapp", label: "WhatsApp Setup", icon: Bot, description: "Connect phone number" },
         { id: "localization", label: "Localization", icon: Languages, description: "Manage languages" },
         { id: "fallback", label: "Fallback", icon: MessageSquare, description: "Default responses" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-background transition-colors duration-500">
            <BotEditorNavbar 
                id={id}
                bot={bot}
                isPublished={bot?.status === "published"}
                activeTab="settings"
                selectedLang="default"
                onLangChange={() => {}}
                isEditingName={isEditingName}
                tempName={tempName}
                onUpdateTempName={setTempName}
                onStartRename={() => setIsEditingName(true)}
                onCancelRename={() => {
                    setTempName(bot?.name || "");
                    setIsEditingName(false);
                }}
                onRename={handleInlineRename}
                onSave={handleSaveAndPublish}
                onPublish={async () => {
                    try {
                        await handleSaveAndPublish();
                    } catch (error) {}
                }}
                onUnpublish={() => archiveBotMutation.mutate(id, {
                    onSuccess: () => toast.success("Bot archived. You can now edit it."),
                    onError: () => toast.error("Failed to archive bot"),
                })}
                isSaving={updateBotMutation.isPending}
                isPublishing={publishBotMutation.isPending}
                isUnpublishing={archiveBotMutation.isPending}
            />

            <main className="flex-1 flex max-w-275 w-full mx-auto py-10 px-6 gap-12 items-start">
               {/* Sidebar */}
               <nav className="w-64 space-y-2 shrink-0 sticky top-28">
                    {navigationItems.map((item) => {
                         const isActive = activeTab === item.id;
                         return (
                              <button
                                   key={item.id}
                                   onClick={() => setActiveTab(item.id)}
                                   className={`w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-300 group ${
                                        isActive 
                                             ? "bg-white dark:bg-muted/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-black/5 dark:border-white/5 text-foreground ring-1 ring-black/5 dark:ring-white/5" 
                                             : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5"
                                   }`}
                              >
                                   <div className={`p-2 rounded-xl transition-colors ${
                                        isActive 
                                             ? "bg-[#FFE600] text-black shadow-[0_0_15px_rgba(255,230,0,0.3)]" 
                                             : "bg-muted/20 dark:bg-muted/10 group-hover:bg-muted/30"
                                   }`}>
                                        <item.icon className="size-4.5" />
                                   </div>
                                   <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{item.label}</span>
                                        <span className="text-[10px] text-muted-foreground/60">{item.description}</span>
                                   </div>
                              </button>
                         )
                    })}
               </nav>

               {/* Main Content Area */}
               <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-2 h-[calc(100vh-140px)]">
                    {activeTab === "general" && (
                         <div className="bg-white dark:bg-card p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                              <div>
                                  <h2 className="text-xl font-bold tracking-tight">General Settings</h2>
                                  <p className="text-sm text-muted-foreground mt-1">Manage your bot's basic info.</p>
                              </div>
                              <div className="p-12 border-2 border-dashed rounded-3xl flex items-center justify-center text-muted-foreground text-sm bg-muted/5">
                                   General settings fields coming soon...
                              </div>
                         </div>
                    )}

                    {activeTab === "localization" && (
                         <div className="bg-white dark:bg-card p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                              <div>
                                  <h2 className="text-xl font-bold tracking-tight">Localization Settings</h2>
                                  <p className="text-sm text-muted-foreground mt-1">Manage bot languages and translations</p>
                              </div>
                              <LocalizationForm 
                                 localization={bot.settings?.localization} 
                                 onChange={handleLocalizationChange}
                              />
                         </div>
                    )}

                    {activeTab === "fallback" && (
                           <div className="bg-white dark:bg-card p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                              <div>
                                  <h2 className="text-xl font-bold tracking-tight">Fallback Defaults</h2>
                                  <p className="text-sm text-muted-foreground mt-1">What happens when things go wrong.</p>
                              </div>
                              <div className="p-12 border-2 border-dashed rounded-3xl flex items-center justify-center text-muted-foreground text-sm bg-muted/5">
                                   Fallback configurations coming soon...
                              </div>
                         </div>
                    )}

                    {activeTab === "whatsapp" && (
                         <div className="bg-white dark:bg-card p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.03)] space-y-10 animate-in slide-in-from-bottom-4 fade-in duration-500 relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">WhatsApp Setup</h2>
                                    <p className="text-sm text-muted-foreground mt-1 font-medium">Connect your Meta WhatsApp Business account.</p>
                                </div>
                                <div className="size-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                                    <Bot className="size-7" />
                                </div>
                              </div>

                             <div className="grid gap-8 max-w-2xl">
                                {/* Step 1: Account Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-7 rounded-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-bold flex items-center justify-center">1</div>
                                        <Label className="text-base font-bold">Select WhatsApp Account</Label>
                                    </div>
                                    <div className="bg-muted/40 dark:bg-muted/10 p-5 rounded-2xl border border-dashed border-black/10 dark:border-white/10 flex flex-col gap-4">
                                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">Available Credentials</p>
                                        <div className="flex items-center gap-3">
                                            <Select 
                                                value={selectedCredentialId} 
                                                onValueChange={(val) => {
                                                    if(val === "CONNECT_NEW") setCredentialsDialogOpen(true);
                                                    else setSelectedCredentialIdSync(val);
                                                }}
                                            >
                                                <SelectTrigger className="w-full sm:max-w-xs bg-background">
                                                    <SelectValue placeholder="Choose account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {credentials.map(c => (
                                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                    ))}
                                                    <div className="h-px bg-border my-1" />
                                                    <SelectItem value="CONNECT_NEW" className="font-medium text-primary cursor-pointer hover:bg-muted py-2.5">
                                                        + Connect new
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {selectedCredentialId && selectedCredentialId !== "CONNECT_NEW" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (window.confirm("Are you sure you want to permanently delete this WhatsApp account? This action cannot be undone.")) {
                                                            deleteMutation.mutate(selectedCredentialId, {
                                                                onSuccess: () => setSelectedCredentialIdSync(""),
                                                            });
                                                        }
                                                    }}
                                                    title="Delete this WhatsApp account"
                                                >
                                                    {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta Auth Modal component rendered independently */}
                                <WhatsAppCredentialsDialog 
                                    orgId={bot.orgId} 
                                    open={isCredentialsDialogOpen} 
                                    onOpenChange={setCredentialsDialogOpen} 
                                    onNewCredentials={(newId) => setSelectedCredentialIdSync(newId)}
                                />

                                {/* Step 2: Configure Integration */}
                                <div className={`space-y-4 transition-opacity duration-300 ${!selectedCredentialId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="size-7 rounded-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-bold flex items-center justify-center">2</div>
                                        <Label className="text-base font-bold">Configure Integration</Label>
                                    </div>
                                    <Accordion type="single" collapsible defaultValue="configure" className="w-full border rounded-2xl overflow-hidden bg-white dark:bg-muted/5 shadow-sm">
                                        <AccordionItem value="configure" className="border-none">
                                            <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 transition-colors">
                                                <span className="font-bold text-sm">Bot behavior settings</span>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-5 pb-6 pt-2 space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <Label className="text-sm">Session expire timeout</Label>
                                                        <Info className="size-3.5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex items-center border rounded-md overflow-hidden bg-background">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-r" onClick={() => handleTimeoutChange(-1)}>-</Button>
                                                        <Input 
                                                            value={timeoutSeconds} 
                                                            onChange={(e) => setTimeoutSecondsSync(parseInt(e.target.value) || 0)}
                                                            className="h-9 w-16 border-none focus-visible:ring-0 text-center rounded-none shadow-none" 
                                                        />
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none border-l" onClick={() => handleTimeoutChange(1)}>+</Button>
                                                    </div>
                                                    <span className="text-sm">hours</span>
                                                </div>

                                                <div className="p-5 border rounded-xl bg-muted/20 space-y-5 transition-all">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Switch 
                                                                id="start-bot-condition"
                                                                checked={startConditionEnabled} 
                                                                onCheckedChange={setStartConditionEnabledSync} 
                                                                className="data-[state=checked]:bg-[#FFE600] dark:data-[state=checked]:bg-[#FFE600]" 
                                                            />
                                                            <Label htmlFor="start-bot-condition" className="font-bold cursor-pointer">Start bot condition</Label>
                                                        </div>
                                                    </div>

                                                    {startConditionEnabled && (
                                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                                            {comparisons.map((comp, idx) => (
                                                                <div key={idx} className="relative group">
                                                                    {idx > 0 && (
                                                                        <div className="flex justify-center my-3 relative">
                                                                            <div className="absolute top-1/2 left-0 w-full h-px bg-border -z-10" />
                                                                            <Select value={logicalOperator} onValueChange={setLogicalOperatorSync}>
                                                                                <SelectTrigger className="w-24 h-8 bg-background text-xs mx-auto">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="AND">AND</SelectItem>
                                                                                    <SelectItem value="OR">OR</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-3 p-3 bg-background border rounded-lg shadow-sm">
                                                                        <span className="text-sm font-medium shrink-0">User message</span>
                                                                        <Select value={comp.operator} onValueChange={(val) => updateComparison(idx, "operator", val)}>
                                                                            <SelectTrigger className="h-9">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="EQUALS">Equals</SelectItem>
                                                                                <SelectItem value="CONTAINS">Contains</SelectItem>
                                                                                <SelectItem value="STARTS_WITH">Starts with</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Input 
                                                                            placeholder="Type a value..." 
                                                                            className="h-9" 
                                                                            value={comp.value} 
                                                                            onChange={(e) => updateComparison(idx, "value", e.target.value)} 
                                                                        />
                                                                        {comparisons.length > 1 && (
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeComparison(idx)}>
                                                                                <Trash className="size-4" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            <Button variant="ghost" className="w-full border-dashed border-2 hover:bg-muted/50 text-muted-foreground h-10" onClick={addComparison}>
                                                                <Plus className="size-4 mr-2" /> Add a comparison
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>

                                {/* Step 3: Publish your bot */}
                                <div className="relative overflow-hidden">
                                    {bot.status === "published" && bot.isConfigured && (
                                        <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl border border-white/50 dark:border-white/10 shadow-inner animate-in fade-in duration-500">
                                            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg flex items-center gap-2 border border-emerald-400/50">
                                                <div className="size-1.5 rounded-full bg-white animate-pulse" />
                                                ACTIVE & PUBLISHED
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col gap-5 p-6 bg-muted/20 dark:bg-muted/5 rounded-2xl border border-black/5 dark:border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-7 rounded-full bg-black dark:bg-white dark:text-black text-white text-[10px] font-bold flex items-center justify-center">3</div>
                                            <Label className="text-base font-bold">Deploy Bot</Label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between bg-white dark:bg-muted/10 p-4 rounded-xl shadow-sm border border-black/5 dark:border-white/5 font-medium">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold">Push to Production</p>
                                                <p className="text-[11px] text-muted-foreground">This will make your bot live on the selected number.</p>
                                            </div>
                                            <Button 
                                                onClick={handleSaveAndPublish} 
                                                disabled={publishBotMutation.isPending || updateBotMutation.isPending || !selectedCredentialId}
                                                className={`h-10 px-8 rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:grayscale ${
                                                    bot.status === "published"
                                                       ? "bg-white/40 dark:bg-white/10 backdrop-blur-md text-foreground border border-white/50 dark:border-white/20 shadow-none hover:bg-white/60" 
                                                       : "bg-[#FFE600] text-black hover:bg-[#F0D800] shadow-[0_4px_12px_rgba(255,230,0,0.3)]"
                                                }`}
                                            >
                                                {publishBotMutation.isPending || updateBotMutation.isPending 
                                                   ? (bot.status === "published" ? "Updating..." : "Publishing...") 
                                                   : (bot.status === "published" ? "Published" : "Publish Now")}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 4: Try it out */}
                                {selectedCredentialId && (
                                    <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-200/50 space-y-4 animate-in zoom-in-95 duration-500">
                                        <div className="flex items-center gap-3">
                                            <div className="size-7 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">4</div>
                                            <Label className="text-base font-bold text-emerald-900">Live Test</Label>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-emerald-800/80 max-w-70">Test your bot in real-time by sending a WhatsApp message.</p>
                                            <a 
                                                href="#" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const credential = credentials.find(c => c.id === selectedCredentialId);
                                                    if(credential) {
                                                        const displayNumber = credential.metadata?.displayPhoneNumber;
                                                        let message = "hi";
                                                        if (startConditionEnabled && comparisons.length > 0 && comparisons[0].value.trim()) {
                                                            message = comparisons[0].value.trim();
                                                        }
                                                        if (displayNumber) {
                                                            window.open(`https://wa.me/${displayNumber}?text=${encodeURIComponent(message)}`, "_blank");
                                                        } else {
                                                            toast.error("Phone number not found for this credential. Please delete it and reconnect using the wizard — it will auto-verify the number.");
                                                        }
                                                    }
                                                }}
                                                className="text-sm font-bold text-emerald-600 flex items-center hover:underline cursor-pointer"
                                            >
                                                Try it out <ExternalLink className="size-4 ml-1.5" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
