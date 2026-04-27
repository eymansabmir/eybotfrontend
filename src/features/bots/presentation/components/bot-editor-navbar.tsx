import { Link } from "@tanstack/react-router";
import { ArrowLeft, Save, Play, Loader2, Rocket, Archive, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { type ChangeEvent, type KeyboardEvent } from "react";
import type { Bot } from "@/features/bots/data/schemas/bot.schema";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { EYLogo } from "@/components/branding/ey-logo";
import { ISO_TO_NATIVE_NAME } from "@/features/i18n/languages";

interface BotEditorNavbarProps {
    id: string;
    bot?: Bot;
    isNew?: boolean;
    isPublished?: boolean;
    activeTab: "flow" | "settings";
    isEditingName: boolean;
    tempName: string;
    selectedLang: string;
    onLangChange: (lang: string) => void;
    onRename: (newName: string) => void;
    onStartRename: () => void;
    onCancelRename: () => void;
    onUpdateTempName: (name: string) => void;
    onSave: () => void;
    onPublish?: () => void;
    onUnpublish?: () => void;
    isSaving?: boolean;
    isPublishing?: boolean;
    isUnpublishing?: boolean;
    isTranslationMode?: boolean;
    liveLanguages?: string[];
}

export function BotEditorNavbar({
    id,
    bot,
    isNew,
    isPublished,
    activeTab,
    isEditingName,
    tempName,
    selectedLang,
    onLangChange,
    onRename,
    onStartRename,
    onCancelRename,
    onUpdateTempName,
    onSave,
    onPublish,
    onUnpublish,
    isSaving,
    isPublishing,
    isUnpublishing,
    isTranslationMode,
    liveLanguages
}: BotEditorNavbarProps) {
    const localization = bot?.settings?.localization;
    const languages = liveLanguages?.length ? liveLanguages : (localization?.languages || []);

    return (
        <header className="flex items-center justify-between border-b px-6 py-3 bg-background/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm border-border">
            <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200/80 bg-white/95 shadow-sm ring-1 ring-black/5 backdrop-blur">
                    <EYLogo className="h-5" />
                </div>
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/50 transition-colors">
                    <Link to="/bots">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 h-6">
                        {isEditingName && !isPublished ? (
                            <Input
                                value={tempName}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateTempName(e.target.value)}
                                onBlur={() => onRename(tempName)}
                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === "Enter") onRename(tempName);
                                    if (e.key === "Escape") onCancelRename();
                                }}
                                autoFocus
                                className="h-7 w-60 text-sm font-semibold px-2 py-0 focus-visible:ring-1 bg-muted/30"
                            />
                        ) : (
                            <h1
                                className={`text-sm font-bold tracking-tight transition-colors px-1 -ml-1 rounded ${!isPublished ? "cursor-pointer hover:bg-muted" : "cursor-default text-foreground/80"}`}
                                onClick={() => !isPublished && onStartRename()}
                                title={isPublished ? "Unpublish to rename bot" : "Click to rename"}
                            >
                                {bot?.name || (isNew ? "New Bot" : "Loading...")}
                            </h1>
                        )}
                        <span className="text-muted-foreground font-normal text-[10px] bg-muted/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">ID: {id.slice(0, 8)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`inline-block size-1.5 rounded-full ${bot?.status === 'published' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                        <span className={bot?.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}>
                            {bot?.status || "Draft"}
                        </span>
                        <span className="opacity-40">|</span>
                        {bot?.updatedAt ? `Saved ${formatDistanceToNow(new Date(bot.updatedAt), { addSuffix: true })}` : "Not saved yet"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {activeTab === "flow" && !isNew && (
                    <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full border border-border/50 transition-all hover:bg-muted/50">
                        <Globe className="size-3 text-muted-foreground" />
                        <Select value={selectedLang} onValueChange={onLangChange}>
                            <SelectTrigger className="h-7 border-none bg-transparent focus:ring-0 text-[11px] font-bold py-0 px-2 min-w-[100px] shadow-none">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default" className="text-[11px] font-medium">Default (English)</SelectItem>
                                {languages.map((lang: string) => (
                                    <SelectItem key={lang} value={lang} className="text-[11px] font-medium">
                                        {ISO_TO_NATIVE_NAME[lang] || lang.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {!isNew && (
                    <div className="flex items-center bg-muted/40 p-1 rounded-full border border-white/50 shadow-inner">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild={activeTab !== "flow"} 
                            className={`h-8 px-5 rounded-full font-bold text-xs transition-all ${activeTab === "flow" ? "bg-white shadow-sm border border-black/5 text-black cursor-default hover:bg-white" : "text-muted-foreground hover:text-foreground hover:bg-transparent"}`}
                            onClick={activeTab === "flow" ? (e) => e.preventDefault() : undefined}
                        >
                            {activeTab === "flow" ? "Flow" : <Link to="/bot/$id" params={{ id }}>Flow</Link>}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild={activeTab !== "settings"} 
                            className={`h-8 px-5 rounded-full font-bold text-xs transition-all ${activeTab === "settings" ? "bg-white shadow-sm border border-black/5 text-black cursor-default hover:bg-white" : "text-muted-foreground hover:text-foreground hover:bg-transparent"}`}
                            onClick={activeTab === "settings" ? (e) => e.preventDefault() : undefined}
                        >
                             {activeTab === "settings" ? "Settings" : <Link to="/bot/$id/settings" params={{ id }}>Settings</Link>}
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {!isNew && bot?.status !== "published" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 h-8 rounded-full font-bold text-xs px-4"
                        onClick={onPublish}
                        disabled={isPublishing || isSaving}
                    >
                        {(isPublishing || isSaving) ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <Rocket className="size-3" />
                        )}
                        Publish
                    </Button>
                )}
                {!isNew && bot?.status === "published" && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 h-8 rounded-full font-bold text-xs px-4"
                        onClick={onUnpublish}
                        disabled={isUnpublishing}
                    >
                        {isUnpublishing ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <Archive className="size-3" />
                        )}
                        Unpublish
                    </Button>
                )}
                
                <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-full font-bold text-xs px-4 shadow-sm border border-black/5" 
                    disabled={isNew} 
                    asChild={!isNew}
                >
                    {isNew ? (
                        <>
                            <Play className="size-3 fill-current" />
                            Test Flow
                        </>
                    ) : (
                        <Link to="/bot/$id/test" params={{ id }}>
                            <Play className="size-3 fill-current" />
                            Test Flow
                        </Link>
                    )}
                </Button>

                {(isNew || bot?.status !== "published") && (
                    <Button
                        size="sm"
                        className="gap-2 px-6 h-8 rounded-full font-bold text-xs shadow-lg bg-black text-white hover:bg-black/90 active:scale-95 transition-all"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="size-3 animate-spin" />
                        ) : (
                            <Save className="size-3" />
                        )}
                        {isNew ? "Create" : (isTranslationMode ? "Update Translation" : "Save Changes")}
                    </Button>
                )}
            </div>
        </header>
    );
}
