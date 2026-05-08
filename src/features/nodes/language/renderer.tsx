import React from "react";
import type { NodeProps } from "@xyflow/react";
import { useReactFlow } from "@xyflow/react";
import { Languages, RefreshCw, Variable, ShieldCheck, ChevronDown, Check, ChevronsUpDown, X } from "lucide-react";
import { useMatch } from "@tanstack/react-router";
import { toast } from "sonner";

import type { LanguageNodeData } from "./schema";
import { cn } from "@/lib/utils";

import { apiClient } from "@/lib/api-client";
import { SUPPORTED_LANGUAGES, COMMON_LANGUAGES } from "@/features/i18n/languages";
import { languageNode } from "./index";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { Switch } from "@/components/ui/switch";
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

export function LanguageNodeRenderer({ id, data, selected }: NodeProps & { data: LanguageNodeData }) {
    const { setNodes, getNodes } = useReactFlow();

    const editorMatch = useMatch({ from: "/bot/$id", shouldThrow: false });
    const testMatch = useMatch({ from: "/bot/$id/test", shouldThrow: false });
    const botId = editorMatch?.params?.id ?? testMatch?.params?.id;

    const [open, setOpen] = React.useState(false);
    const [isSyncing, setIsSyncing] = React.useState(false);

    const handleUpdateData = (newData: Partial<LanguageNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => node.id === id ? { ...node, data: { ...node.data, ...newData } } : node)
        );
    };

    const nodeLanguages = Array.isArray(data.languages) ? data.languages : [];
    const nodeLocalizationEnabled = typeof data.localizationEnabled === "boolean" ? data.localizationEnabled : undefined;
    const hasNodeLocalization = nodeLocalizationEnabled !== undefined || nodeLanguages.length > 0 || Boolean(data.defaultLanguage);

    const effectiveLocalization: { isEnabled: boolean; languages: string[]; defaultLanguage?: string } = hasNodeLocalization
        ? {
            isEnabled: !!(nodeLocalizationEnabled ?? (nodeLanguages.length > 0)),
            languages: nodeLanguages,
            defaultLanguage: data.defaultLanguage || nodeLanguages[0],
        }
        : {
            isEnabled: false,
            languages: [],
            defaultLanguage: undefined,
        };

    const isEnabled = effectiveLocalization.isEnabled;
    const enabledLanguages = effectiveLocalization.languages;

    const getLanguageName = (code: string) => {
        return Object.entries(SUPPORTED_LANGUAGES).find(([_, c]) => c === code)?.[0] || code;
    };

    const handleToggleLocalization = (checked: boolean) => {
        handleUpdateData({ localizationEnabled: checked });
    };

    const handleAddLanguage = (langCode: string) => {
        const currentLangs = Array.isArray(data.languages) ? data.languages : [];
        if (currentLangs.includes(langCode)) return;

        if (currentLangs.length >= 10) {
            toast.error("Maximum 10 languages allowed per node.");
            return;
        }

        const newLangs = [...currentLangs, langCode];
        handleUpdateData({ languages: newLangs, localizationEnabled: true });
    };

    const handleRemoveLanguage = (langCode: string) => {
        const currentLangs = Array.isArray(data.languages) ? data.languages : [];
        const newLangs = currentLangs.filter((l) => l !== langCode);
        handleUpdateData({ languages: newLangs });
    };

    const handleSync = async () => {
        if (!botId) {
            toast.error("Flow not found. Please save the bot first.");
            return;
        }

        setIsSyncing(true);
        try {
            const currentNodes = getNodes();
            await apiClient.post(`/flows/${botId}/sync-translations`, { nodes: currentNodes });
            toast.success("Translations synced successfully.");
        } catch (error) {
            toast.error((error as Error)?.message || "Failed to sync translations");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<Languages size={16} />}
            title="Language"
            popoverTitle="Configure Language"
            description={languageNode.config.description}
            summary={isEnabled ? `${enabledLanguages.length} languages enabled` : "Localization disabled"}
            showPopover={selected}
            popoverBody={
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-muted/20 p-2 rounded-xl border border-[var(--border-dim)]">
                        <div className="flex flex-col gap-0.5">
                            <label className="text-[9px] font-bold text-foreground/70 uppercase tracking-tight">Localization</label>
                            <p className="text-[8px] text-muted-foreground leading-none">Enable multi-language</p>
                        </div>
                        <Switch
                            checked={isEnabled}
                            size="sm"
                            onCheckedChange={handleToggleLocalization}
                            disabled={data.isTranslationMode}
                        />
                    </div>

                    {isEnabled && (
                        <div className="space-y-3 pt-1">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Enabled Languages</label>

                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            disabled={data.isTranslationMode}
                                            className={cn(
                                                "w-full justify-between h-8 bg-primary/10 border-primary/30 hover:bg-primary/20 text-foreground font-medium text-[11px]",
                                                data.isTranslationMode && "opacity-50 grayscale-[0.5] cursor-not-allowed"
                                            )}
                                            title={data.isTranslationMode ? "Structural changes must be made in Default (English) view" : undefined}
                                        >
                                            <span className="opacity-70">Add language...</span>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[240px] p-0" align="start" side="bottom">
                                        <Command>
                                            <CommandInput placeholder="Search language..." className="h-8 text-[11px]" />
                                            <CommandList>
                                                <CommandEmpty>No language found.</CommandEmpty>
                                                <CommandGroup>
                                                    {COMMON_LANGUAGES
                                                        .filter((name) => !enabledLanguages.includes(SUPPORTED_LANGUAGES[name]))
                                                        .map((name) => (
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
                                    {enabledLanguages.map((code) => (
                                        <Badge
                                            key={code}
                                            variant="secondary"
                                            className={cn(
                                                "h-5 px-2 py-0 text-[10px] font-bold bg-primary text-primary-foreground border-primary/20 flex items-center gap-1.5 shadow-sm transition-all cursor-default",
                                                !data.isTranslationMode && "hover:bg-primary/90"
                                            )}
                                        >
                                            {getLanguageName(code)}
                                            {!data.isTranslationMode && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveLanguage(code);
                                                    }}
                                                    className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X size={10} strokeWidth={3} />
                                                </button>
                                            )}
                                        </Badge>
                                    ))}
                                    {enabledLanguages.length === 0 && (
                                        <span className="text-[10px] text-muted-foreground italic px-1">No languages added yet.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-dim)]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Question Prompt</label>
                            <NodeFrame.Tooltip>
                                Message sent to user to ask for their language. Max 1024 characters.
                            </NodeFrame.Tooltip>
                        </div>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all placeholder:italic"
                            value={data.message || ""}
                            maxLength={1024}
                            placeholder="Select your preferred language..."
                            onChange={(e) => handleUpdateData({ message: e.target.value })}
                            disabled={!isEnabled}
                        />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-[var(--border-dim)]">
                        <div className="flex items-center gap-1.5">
                            <Variable size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Save Selection To</label>
                        </div>

                        <VariableSelect
                            value={data.variableName || ""}
                            onValueChange={(val: string) => handleUpdateData({ variableName: val })}
                            placeholder="e.g. selected_language"
                            className={!isEnabled ? "opacity-50 pointer-events-none" : ""}
                        />

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck size={10} className="text-muted-foreground" />
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Storage Scope</label>
                            </div>
                            <div className="relative">
                                <select
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all appearance-none cursor-pointer"
                                    value={data.variableScope || "session"}
                                    onChange={(e) => handleUpdateData({ variableScope: e.target.value as "session" | "contact" })}
                                    disabled={!isEnabled}
                                >
                                    <option value="session">Session</option>
                                    <option value="contact">Contact Custom Field</option>
                                </select>
                                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between bg-primary/5 p-2 rounded-xl border border-primary/10 mt-1">
                            <div className="flex flex-col gap-0.5">
                                <label className="text-[9px] font-bold text-ey-yellow-text uppercase tracking-tight">Skip logic</label>
                                <p className="text-[8px] text-muted-foreground leading-none font-medium">Skip if already selected</p>
                            </div>
                            <Switch
                                checked={data.skipIfAlreadySelected || false}
                                size="sm"
                                onCheckedChange={(checked) => handleUpdateData({ skipIfAlreadySelected: checked })}
                                disabled={!isEnabled}
                            />
                        </div>
                    </div>

                    {isEnabled && (
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={cn(
                                "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-bold transition-all border border-[var(--border-dim)] bg-muted/20 text-foreground hover:bg-muted/40",
                                isSyncing && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <RefreshCw size={12} className={cn(isSyncing && "animate-spin")} />
                            {isSyncing ? "Syncing..." : "Sync Translations"}
                        </button>
                    )}
                </div>
            }
        />
    );
}
