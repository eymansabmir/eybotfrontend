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
  Check
} from "lucide-react";
import type { MediaConditionalNodeData, MediaConditionalEntry } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";
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
import { v4 as uuidv4 } from "uuid";
import { LockedBadge } from "@/components/ui/locked-badge";

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
            branches: updatedBranches
          };
        }
        return node;
      })
    );
  };

  const addEntry = () => {
    const type = "image";
    const existingCount = data.config.filter(e => e.type === type).length;
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
          const typeCount = data.config.filter(item => item.type === updates.type && item.id !== entryId).length;
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

  return (
    <div
      className={cn(
        "group relative min-w-[320px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
        selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-500">
            <FileSpreadsheet size={14} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
            Smart Media Input {isTranslationMode && <span className="ml-2 text-primary">(Translation)</span>}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Messages */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Prompt Message</label>
            <textarea
              className="w-full min-h-[50px] bg-muted/50 rounded-xl border border-border/50 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              value={data.message}
              placeholder="e.g. Please upload your ID card image."
              onChange={(e) => updateData({ message: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <AlertCircle size={10} className="text-destructive" />
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Invalid Type Message</label>
            </div>
            <textarea
              className="w-full min-h-[40px] bg-muted/50 rounded-xl border border-border/50 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
              value={data.invalidMessage}
              placeholder="e.g. Sorry, only JPG or PNG images are allowed."
              onChange={(e) => updateData({ invalidMessage: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-[80px] space-y-1.5">
              <div className="flex items-center gap-2">
                 <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Max Retries</label>
                 {isTranslationMode && <LockedBadge />}
              </div>
              <input
                type="number"
                min="1"
                max="10"
                disabled={isTranslationMode}
                className={cn("nodrag w-full bg-muted/50 rounded-lg border border-border/50 p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium", isTranslationMode && "opacity-50 cursor-not-allowed")}
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
              <textarea
                className="w-full h-[36px] bg-muted/50 rounded-lg border border-border/50 p-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                value={data.maxRetriesMessage}
                placeholder="e.g. Too many attempts, restart bot."
                onChange={(e) => updateData({ maxRetriesMessage: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Entries */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Allowed Inputs & Branches</label>
              {isTranslationMode && <LockedBadge />}
            </div>
            {!isTranslationMode && (
              <button
                onClick={addEntry}
                className="rounded-md bg-primary/10 p-1 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus size={12} />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {data.config.map((entry) => {
              const Icon = TYPE_ICONS[entry.type];
              return (
                <div key={entry.id} className="relative flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-2.5">
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
                        {entry.subTypes.map(tag => (
                          <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20 gap-1 pr-1">
                            {tag}
                            {!isTranslationMode && (
                              <button 
                                onClick={() => {
                                  updateEntry(entry.id, { subTypes: entry.subTypes.filter(t => t !== tag) });
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
                            <Button variant="outline" size="sm" className="w-full h-7 text-[10px] gap-2 border-dashed bg-transparent border-indigo-500/30 text-indigo-500/70 hover:bg-indigo-500/5 hover:text-indigo-500">
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
                                        updateEntry(entry.id, { subTypes: current.filter(f => f !== format) });
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
                    className="!-right-1.5 h-3 w-3 border-2 border-background bg-indigo-500 shadow-sm hover:scale-125 transition-transform"
                    style={{ top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Variable Storage */}
        <div className="space-y-1.5 pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5">
            <Variable size={10} className="text-muted-foreground" />
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Save Input To</label>
          </div>
          <VariablesCombobox
            value={data.variable || ""}
            onChange={(val) => updateData({ variable: val })}
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

      <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-indigo-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
    </div>
  );
}
