import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Languages, RefreshCw, Variable, ShieldCheck, ChevronDown } from "lucide-react";

import type { LanguageNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { useMatch } from "@tanstack/react-router";
import { useBot } from "@/features/bots/data/queries/use-bots";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { SUPPORTED_LANGUAGES, COMMON_LANGUAGES } from "@/features/i18n/languages";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";
import { Switch } from "@/components/ui/switch";
import { useUpdateBot } from "@/features/bots/data/queries/use-bots";
import { 
    Command, 
    CommandInput, 
    CommandList, 
    CommandEmpty, 
    CommandGroup, 
    CommandItem 
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";






export function LanguageNodeRenderer({ id, data, selected }: NodeProps & { data: LanguageNodeData }) {
    const { setNodes } = useReactFlow();

    // This renderer is used inside FlowBuilder which is mounted on multiple routes.
    // We use useMatch on both possible routes to safely extract the bot ID.
    const editorMatch = useMatch({ from: "/bot/$id", shouldThrow: false });
    const testMatch = useMatch({ from: "/bot/$id/test", shouldThrow: false });
    const botId = editorMatch?.params?.id ?? testMatch?.params?.id;

    const { data: bot } = useBot(botId ?? "");

    const localization = bot?.settings?.localization;
    const nodeLanguages = Array.isArray(data.languages) ? data.languages : [];
    const nodeLocalizationEnabled = typeof data.localizationEnabled === "boolean" ? data.localizationEnabled : undefined;
    const hasNodeLocalization = nodeLocalizationEnabled !== undefined || nodeLanguages.length > 0 || Boolean(data.defaultLanguage);

    const effectiveLocalization = hasNodeLocalization
        ? {
            isEnabled: !!(nodeLocalizationEnabled ?? (nodeLanguages.length > 0)),
            languages: nodeLanguages,
            defaultLanguage: data.defaultLanguage || nodeLanguages[0],
        }
        : {
            isEnabled: !!localization?.isEnabled,
            languages: localization?.languages ?? [],
            defaultLanguage: localization?.defaultLanguage,
        };


    const isEnabled = effectiveLocalization.isEnabled;
    const [open, setOpen] = React.useState(false);


    const { mutate: updateBot } = useUpdateBot(botId ?? "");

    const handleToggleLocalization = (checked: boolean) => {
        if (!botId || !bot) return;
        
        updateBot({
            settings: {
                ...bot.settings,
                localization: {
                    ...bot.settings?.localization,
                    isEnabled: checked,
                    languages: bot.settings?.localization?.languages ?? [],
                }
            }
        });
        
        updateData({ localizationEnabled: checked });
    };

    const handleAddLanguage = (langCode: string) => {
        if (!botId || !bot) return;
        
        const currentLangs = bot.settings?.localization?.languages ?? [];
        if (currentLangs.includes(langCode)) return;
        
        const newLangs = [...currentLangs, langCode];
        
        updateBot({
            settings: {
                ...bot.settings,
                localization: {
                    ...bot.settings?.localization,
                    isEnabled: true,
                    languages: newLangs,
                }
            }
        });
        
        updateData({ languages: newLangs, localizationEnabled: true });
    };

    const handleRemoveLanguage = (langCode: string) => {
        if (!botId || !bot) return;
        
        const currentLangs = bot.settings?.localization?.languages ?? [];
        const newLangs = currentLangs.filter(l => l !== langCode);
        
        updateBot({
            settings: {
                ...bot.settings,
                localization: {
                    ...bot.settings?.localization,
                    isEnabled: bot.settings?.localization?.isEnabled ?? false,
                    languages: newLangs,
                }
            }
        });

        
        updateData({ languages: newLangs });
    };


    const updateData = (newData: Partial<LanguageNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, ...newData } };
                }
                return node;
            })
        );
    };


    const enabledLanguages = effectiveLocalization.languages;
    const getLanguageName = (code: string) => {
        return Object.entries(SUPPORTED_LANGUAGES).find(([_, c]) => c === code)?.[0] || code;
    };

    const [isSyncing, setIsSyncing] = React.useState(false);

    const handleSync = async () => {
        if (!botId) {
            toast.error("Flow not found. Please save the bot first.");
            return;
        }
        setIsSyncing(true);
        try {
            await apiClient.post(`/flows/${botId}/sync-translations`);
            toast.success('Translations synced successfully.');
        } catch (error) {
            toast.error((error as Error)?.message || 'Failed to sync translations');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div
            className={cn(
                "flow-node-standard group relative rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
            style={{ maxWidth: '320px' }}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                        <Languages size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Language Selector
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Localization Control */}
                <div className="flex items-center justify-between bg-muted/20 p-2 rounded-xl border border-border/50">
                    <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-foreground/70 uppercase tracking-tight">Localization</label>
                        <p className="text-[8px] text-muted-foreground leading-none">Enable multi-language</p>
                    </div>
                    <Switch 
                        checked={isEnabled} 
                        size="sm"
                        onCheckedChange={handleToggleLocalization}
                    />
                </div>

                {isEnabled && (
                    <div className="space-y-3 pt-1">
                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Enabled Languages</label>
                             </div>
                             
                             {/* Language Selector */}
                             <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between h-8 bg-primary/5 border-primary/20 hover:bg-primary/10 text-primary font-medium text-[11px]"
                                    >
                                        Add language...
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start" side="bottom">
                                    <Command>
                                        <CommandInput placeholder="Search language..." className="h-8 text-[11px]" />
                                        <CommandList>
                                            <CommandEmpty>No language found.</CommandEmpty>
                                            <CommandGroup>
                                                {COMMON_LANGUAGES.filter(name => !enabledLanguages.includes(SUPPORTED_LANGUAGES[name])).map((name) => (
                                                    <CommandItem
                                                        key={name}
                                                        value={name}
                                                        onSelect={() => {
                                                            handleAddLanguage(SUPPORTED_LANGUAGES[name]);
                                                            setOpen(false);
                                                        }}
                                                        className="text-[11px] cursor-pointer"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-3 w-3",
                                                                enabledLanguages.includes(SUPPORTED_LANGUAGES[name]) ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                             </Popover>


                             <div className="flex flex-wrap gap-1.5 max-w-[280px] pt-1">
                                {enabledLanguages.map((code: string) => (
                                    <Badge 
                                        key={code} 
                                        variant="secondary"
                                        className="h-5 px-1.5 py-0 text-[9px] font-medium bg-primary/5 hover:bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                                    >
                                        {getLanguageName(code)}
                                        <button 
                                            onClick={() => handleRemoveLanguage(code)}
                                            className="hover:text-destructive transition-colors"
                                        >
                                            <X size={10} />
                                        </button>
                                    </Badge>
                                ))}
                                {enabledLanguages.length === 0 && (
                                    <span className="text-[10px] text-muted-foreground italic px-1">No languages added yet.</span>
                                )}
                             </div>
                        </div>
                    </div>
                )}


                {/* Message Input */}
                <div className="space-y-1.5 opacity-100 group-hover:opacity-100 transition-opacity">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Question Prompt</label>
                    <textarea
                        className="w-full min-h-15 bg-muted/50 rounded-xl border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:italic"
                        value={data.message || ""}
                        placeholder="Select your preferred language..."
                        onChange={(e) => updateData({ message: e.target.value })}
                    />
                </div>

                {/* Variable Mapping */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                        <Variable size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Save Selection To</label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                        <VariablesCombobox 
                            value={data.variableName || ""} 
                            onChange={(val) => updateData({ variableName: val })} 
                            placeholder="e.g. selected_language" 
                            className={!isEnabled ? "opacity-50 pointer-events-none" : ""}
                        />


                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={10} className="text-muted-foreground" />
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Storage Scope</label>
                            </div>
                            <div className="relative">
                                <select
                                    className="w-full bg-muted/50 rounded-lg border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer hover:bg-muted"
                                    value={data.variableScope || "session"}
                                    onChange={(e) => updateData({ variableScope: e.target.value as "session" | "contact" })}
                                    disabled={!isEnabled}
                                >
                                    <option value="session">Session</option>
                                    <option value="contact">Contact Custom Field</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                            </div>
                        </div>

                        {/* Skip Logic Toggle */}
                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-xl border border-primary/10 mt-1">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-bold text-primary/80 uppercase tracking-tight">Skip logic</label>
                                <p className="text-[8px] text-muted-foreground leading-none font-medium">Skip if already selected</p>
                            </div>
                            <Switch 
                                checked={data.skipIfAlreadySelected || false} 
                                size="sm"
                                onCheckedChange={(checked) => updateData({ skipIfAlreadySelected: checked })}
                                disabled={!isEnabled}
                            />
                        </div>
                    </div>
                </div>

                {isEnabled && (
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={cn(
                            "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[11px] font-bold transition-all border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
                            isSyncing && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <RefreshCw size={12} className={cn(isSyncing && "animate-spin")} />
                        {isSyncing ? "Syncing..." : "Sync Translations"}
                    </button>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Bottom}
                className="h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
            />

            {/* Visual background element */}
            <div className="absolute inset-x-0 -bottom-px h-0.5 scale-x-0 bg-primary transition-transform group-hover:scale-x-100 rounded-b-2xl" />
        </div>
    );
}
