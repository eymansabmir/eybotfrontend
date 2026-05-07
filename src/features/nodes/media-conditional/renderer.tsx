import { Handle, Position, useUpdateNodeInternals } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import {
    FileSpreadsheet,
    Variable,
    Plus,
    Trash2,
    Type,
    Image as ImageIcon,
    Video,
    Music,
    File,
    MapPin,
    AlertCircle,
    Check,
} from "lucide-react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import type { MediaConditionalNodeData, MediaConditionalEntry } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { LockedBadge } from "@/components/ui/locked-badge";
import { cn } from "@/lib/utils";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { SortableList } from "@/components/ui/sortable-list";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { MediaConditionalNode } from "./index";

const TYPE_ICONS = {
    text: Type,
    image: ImageIcon,
    video: Video,
    audio: Music,
    document: File,
    location: MapPin,
};

const FORMAT_OPTIONS = {
    image: ["jpg", "jpeg", "png", "webp", "gif"],
    video: ["mp4", "m4v", "mov", "avi", "mkv"],
    audio: ["mp3", "ogg", "wav", "aac", "m4a", "opus"],
    document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "zip", "rar"],
};

const DEFAULT_SUBTYPES: Record<string, string[]> = {
    image: ["jpg", "jpeg", "png"],
    video: ["mp4"],
    audio: ["mp3"],
    document: ["pdf"],
    text: [],
    location: [],
};

export function MediaConditionalNodeRenderer({ id, data, selected }: NodeProps & { data: MediaConditionalNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes, setEdges } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const isTranslationMode = !!data.isTranslationMode;

    useEffect(() => {
        updateNodeInternals(id);
    }, [data.config, id, updateNodeInternals]);

    const updateData = (newData: Partial<MediaConditionalNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    const updatedData = { ...node.data, ...newData };
                    const updatedBranches = (updatedData.config as MediaConditionalEntry[]).map((e) => ({
                        key: e.branchKey,
                        label: e.branchKey.charAt(0).toUpperCase() + e.branchKey.slice(1),
                    }));
                    return {
                        ...node,
                        data: updatedData,
                        branches: updatedBranches,
                    };
                }
                return node;
            })
        );
    };

    const addEntry = () => {
        const type = "image";
        const existingCount = data.config.filter((e) => e.type === type).length;
        const branchKey = existingCount > 0 ? `${type}_${existingCount + 1}` : type;

        const newEntry: MediaConditionalEntry = {
            id: uuidv4(),
            type,
            subTypes: [...(DEFAULT_SUBTYPES[type] || [])],
            branchKey,
        };
        updateData({ config: [...data.config, newEntry] });
    };

    const removeEntry = (entryId: string) => {
        const entryToRemove = data.config.find((e) => e.id === entryId);
        if (entryToRemove) {
            setEdges((eds) =>
                eds.filter((ed) => !(ed.source === id && ed.sourceHandle === entryToRemove.branchKey))
            );
        }
        updateData({ config: data.config.filter((e) => e.id !== entryId) });
    };

    const updateEntry = (entryId: string, updates: Partial<MediaConditionalEntry>) => {
        let edgeMigration: { oldKey: string; newKey: string } | null = null;

        const newConfig = data.config.map((e) => {
            if (e.id === entryId) {
                const updated = { ...e, ...updates };
                if (updates.type && updates.type !== e.type) {
                    const typeCount = data.config.filter((item) => item.type === updates.type && item.id !== entryId).length;
                    updated.branchKey = typeCount > 0 ? `${updates.type}_${typeCount + 1}` : (updates.type as string);
                    updated.subTypes = [...(DEFAULT_SUBTYPES[updates.type] || [])];

                    if (updated.branchKey !== e.branchKey) {
                        edgeMigration = { oldKey: e.branchKey, newKey: updated.branchKey };
                    }
                }
                return updated;
            }
            return e;
        });

        if (edgeMigration) {
            const { oldKey, newKey } = edgeMigration;
            setEdges((eds) =>
                eds.map((ed) => {
                    if (ed.source === id && ed.sourceHandle === oldKey) {
                        return { ...ed, sourceHandle: newKey };
                    }
                    return ed;
                })
            );
        }

        updateData({ config: newConfig });
    };

    const summary = data.message || `${data.config.length} media input branches configured`;

    return (
        <NodeFrame
            selected={selected}
            icon={<FileSpreadsheet size={16} />}
            title="Smart Media Input"
            popoverTitle="Configure Smart Media Input"
            description={MediaConditionalNode.config.description}
            summary={summary}
            showPopover={selected}
            showBottomHandle={false}
            compactClassName="w-[240px]"
            popoverClassName="w-[380px]"
            compactBody={
                <div className="space-y-1.5">
                    {data.config.slice(0, 3).map((entry) => {
                        const Icon = TYPE_ICONS[entry.type];
                        return (
                            <div key={entry.id} className="relative flex items-center rounded-md border border-[var(--border-dim)] bg-background px-2 py-1">
                                <Icon size={10} className="text-muted-foreground mr-1.5" />
                                <span className="text-[10px] text-foreground/80 truncate pr-3">{entry.branchKey}</span>
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={entry.branchKey}
                                    className="!right-[-14px] top-1/2 -translate-y-1/2 h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                                />
                            </div>
                        );
                    })}
                    {data.config.length > 3 && (
                        <div className="text-[10px] text-muted-foreground italic px-0.5">+{data.config.length - 3} more branches</div>
                    )}
                </div>
            }
            popoverBody={
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Prompt Message</label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            The initial message sent to the user asking for media (e.g. "Please upload your ID").
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <AutosizeTextarea
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                                value={data.message}
                                placeholder="e.g. Please upload your ID card image."
                                onChange={(e) => updateData({ message: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <AlertCircle size={10} className="text-destructive" />
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Invalid Type Message</label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            Message sent if the user uploads the wrong type of media or an unsupported format.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <AutosizeTextarea
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                                value={data.invalidMessage}
                                placeholder="e.g. Sorry, only JPG or PNG images are allowed."
                                onChange={(e) => updateData({ invalidMessage: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <div className="w-[80px] space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Max Retries</label>
                                    <TooltipProvider>
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild>
                                                <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                                How many times the user can try uploading before the bot stops or moves on.
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    {isTranslationMode && <LockedBadge />}
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    disabled={isTranslationMode}
                                    className={cn("nodrag w-full bg-background rounded-lg border border-[var(--border-dim)] p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all font-medium", isTranslationMode && "opacity-50 cursor-not-allowed")}
                                    value={data.maxRetries === undefined ? "" : data.maxRetries}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateData({ maxRetries: val === "" ? undefined : Number(val) });
                                    }}
                                />
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center gap-1">
                                    <AlertCircle size={10} className="text-destructive/70" />
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Max Retries Message</label>
                                </div>
                                <AutosizeTextarea
                                    className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={data.maxRetriesMessage}
                                    placeholder="e.g. Too many attempts, restart bot."
                                    onChange={(e) => updateData({ maxRetriesMessage: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 border-t border-[var(--border-dim)] pt-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Allowed Inputs & Branches</label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            Define which media types to accept and create branches for each.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {isTranslationMode && <LockedBadge />}
                            </div>
                            {!isTranslationMode && (
                                <button
                                    onClick={addEntry}
                                    className="rounded-md bg-[var(--ey-yellow)]/20 p-1 text-foreground hover:bg-[var(--ey-yellow)]/30 transition-colors"
                                >
                                    <Plus size={12} />
                                </button>
                            )}
                        </div>

                        <SortableList
                            items={data.config ?? []}
                            onReorder={(newConfig: any[]) => updateData({ config: newConfig })}
                            keyExtractor={(entry: any) => entry.id}
                            renderItem={(entry: any) => {
                                const Icon = TYPE_ICONS[entry.type as keyof typeof TYPE_ICONS];
                                return (
                                    <div className="relative flex flex-col gap-2 rounded-lg border border-[var(--border-dim)] bg-muted/10 p-2.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-background p-1.5 shadow-sm">
                                                <Icon size={12} className="text-foreground/70" />
                                            </div>
                                            <select
                                                disabled={isTranslationMode}
                                                className={cn("flex-1 bg-transparent text-[11px] font-medium focus:outline-none", isTranslationMode && "opacity-50 cursor-not-allowed")}
                                                value={entry.type}
                                                onChange={(e) => updateEntry(entry.id, { type: e.target.value as any })}
                                            >
                                                <option value="text">Text</option>
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                                <option value="audio">Audio</option>
                                                <option value="document">Document</option>
                                                <option value="location">Location</option>
                                            </select>
                                            {!isTranslationMode && (
                                                <button
                                                    onClick={() => removeEntry(entry.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>

                                        {["image", "video", "audio", "document"].includes(entry.type) && (
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-semibold text-muted-foreground uppercase">Allowed Formats</label>
                                                <div className="flex flex-wrap gap-1 mb-1.5 min-h-[24px]">
                                                    {entry.subTypes.map((tag: string) => (
                                                        <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px] bg-[var(--ey-yellow)]/15 text-foreground border-[var(--ey-yellow)]/30 gap-1 pr-1">
                                                            {tag}
                                                            {!isTranslationMode && (
                                                                <button
                                                                    onClick={() => {
                                                                        updateEntry(entry.id, { subTypes: entry.subTypes.filter((t: string) => t !== tag) });
                                                                    }}
                                                                    className="hover:text-destructive p-0.5"
                                                                >
                                                                    <Plus className="rotate-45" size={10} />
                                                                </button>
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {!isTranslationMode && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-2 border-dashed bg-transparent border-[var(--border-dim)] text-muted-foreground hover:bg-muted/20 hover:text-foreground">
                                                                <Plus size={10} />
                                                                Add Formats
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[180px] p-0" align="start">
                                                            <Command>
                                                                <CommandInput placeholder="Search format..." className="h-8 text-xs" />
                                                                <CommandList>
                                                                    <CommandEmpty>No format found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {(FORMAT_OPTIONS[entry.type as keyof typeof FORMAT_OPTIONS] || []).map((format) => (
                                                                            <CommandItem
                                                                                key={format}
                                                                                onSelect={() => {
                                                                                    const current = entry.subTypes;
                                                                                    if (current.includes(format)) {
                                                                                        updateEntry(entry.id, { subTypes: current.filter((f: string) => f !== format) });
                                                                                    } else {
                                                                                        updateEntry(entry.id, { subTypes: [...current, format] });
                                                                                    }
                                                                                }}
                                                                                className="text-xs cursor-pointer"
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-3 w-3",
                                                                                        entry.subTypes.includes(format) ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {format}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                        )}

                                        <Handle
                                            type="source"
                                            position={Position.Right}
                                            id={entry.branchKey}
                                            className="!-right-1.5 h-3 w-3 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                                            style={{ top: "50%", transform: "translateY(-50%)" }}
                                        />
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-dim)]">
                        <div className="flex items-center gap-1.5">
                            <Variable size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Save Input To</label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        Select where to save the URL of the uploaded media.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <VariableSelect
                            value={data.variable || ""}
                            onValueChange={(val: string) => updateData({ variable: val })}
                            placeholder="e.g. user_media_url"
                        />
                        <div className="flex items-center gap-4 mt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`scope-${id}`}
                                    checked={data.variableScope === "session"}
                                    onChange={() => updateData({ variableScope: "session" })}
                                    className="h-2.5 w-2.5 border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-[9px] font-medium text-muted-foreground">Session</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                    type="radio"
                                    name={`scope-${id}`}
                                    checked={data.variableScope === "contact"}
                                    onChange={() => updateData({ variableScope: "contact" })}
                                    className="h-2.5 w-2.5 border-border text-primary focus:ring-primary/20"
                                />
                                <span className="text-[9px] font-medium text-muted-foreground">Contact</span>
                            </label>
                        </div>
                    </div>
                </div>
            }
        />
    );
}
