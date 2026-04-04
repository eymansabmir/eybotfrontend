import React from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Languages, AlertCircle, ExternalLink, RefreshCw, Variable, ShieldCheck, ChevronDown } from "lucide-react";
import type { LanguageNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { useMatch } from "@tanstack/react-router";
import { useBot } from "@/features/bots/data/queries/use-bots";
import { NATIVE_LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from "@/features/i18n/languages";

export function LanguageNodeRenderer({ id, data, selected }: NodeProps & { data: LanguageNodeData }) {
    const { setNodes } = useReactFlow();

    // This renderer is used inside FlowBuilder which is mounted on multiple routes.
    // We use useMatch on both possible routes to safely extract the bot ID.
    const editorMatch = useMatch({ from: "/bot/$id", shouldThrow: false });
    const testMatch = useMatch({ from: "/bot/$id/test", shouldThrow: false });
    const botId = editorMatch?.params?.id ?? testMatch?.params?.id;

    const { data: bot } = useBot(botId ?? "");


    const localization = bot?.settings?.localization;
    const isEnabled = localization?.isEnabled ?? false;
    const enabledLanguages = localization?.languages ?? [];

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

    const getLanguageName = (code: string) => {
        const name = Object.entries(SUPPORTED_LANGUAGES).find(([_, c]) => c === code)?.[0] || code;
        return `${name} (${NATIVE_LANGUAGE_NAMES[name] || code})`;
    };
    
    const [isSyncing, setIsSyncing] = React.useState(false);
    
    const handleSync = async () => {
        if (!botId) return;
        setIsSyncing(true);
        try {
            const response = await fetch(`http://localhost:3000/api/flows/${botId}/sync-translations`, {
                method: 'POST',
            });
            if (response.ok) {
                // You might want to show a success toast here if you had a toast system
                console.log('Translations synced');
            }
        } catch (error) {
            console.error('Failed to sync translations:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const openSettings = () => {
        window.dispatchEvent(new CustomEvent('open-bot-settings'));
    };

    return (
        <div
            className={cn(
                "group relative min-w-[280px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
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
                {!isEnabled ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-amber-700">
                             <AlertCircle size={14} />
                             <span className="text-[10px] font-bold uppercase">Localization Disabled</span>
                        </div>
                        <p className="text-[11px] text-amber-600">
                            Enable localization in <span onClick={openSettings} className="font-bold underline cursor-pointer">Bot Settings</span> to use this node.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                             <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Enabled Languages</label>
                             <span onClick={openSettings} className="text-[9px] font-medium text-primary flex items-center gap-1 cursor-pointer hover:underline">
                                <ExternalLink size={10} />
                                Edit Settings
                             </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                            {enabledLanguages.map(code => (
                                <div key={code} className="px-2 py-1 rounded-md bg-primary/5 border border-primary/10 text-[9px] font-medium text-primary whitespace-nowrap">
                                    {getLanguageName(code)}
                                </div>
                            ))}
                            {enabledLanguages.length === 0 && (
                                <span className="text-[11px] text-muted-foreground italic">No languages selected yet.</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="space-y-1.5 opacity-100 group-hover:opacity-100 transition-opacity">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Question Prompt</label>
                    <textarea
                        className="w-full min-h-[60px] bg-muted/50 rounded-xl border border-border/50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all placeholder:italic"
                        value={data.message || ""}
                        placeholder="Select your preferred language..."
                        onChange={(e) => updateData({ message: e.target.value })}
                        disabled={!isEnabled}
                    />
                </div>

                {/* Variable Mapping */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                        <Variable size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Save Selection To</label>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40">@</span>
                            <input
                                type="text"
                                className="w-full bg-primary/5 rounded-lg border border-primary/20 pl-7 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-primary"
                                value={data.variableName || "selected_language"}
                                placeholder="variable_name"
                                onChange={(e) => updateData({ variableName: e.target.value })}
                                disabled={!isEnabled}
                            />
                        </div>

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
            <div className="absolute inset-x-0 -bottom-px h-[2px] scale-x-0 bg-primary transition-transform group-hover:scale-x-100 rounded-b-2xl" />
        </div>
    );
}
