import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { List as ListIcon, Trash2, MessageSquare, Type, Footprints, Info } from "lucide-react";
import type { ListNodeData } from "./schema";
import { listNode } from "./index";
import { useReactFlow } from "@xyflow/react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { VariableSelect } from "@/features/variables/components/variable-select";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { SortableList } from "@/components/ui/sortable-list";

export function ListNodeRenderer({ id, data, selected }: NodeProps & { data: ListNodeData & { isTranslationMode?: boolean } }) {
    const { setNodes } = useReactFlow();
    const isTranslationMode = !!data.isTranslationMode;

    const allRows = (data.sections ?? []).flatMap((s) => s.rows);

    const syncBranchesAndInteraction = (sections: ListNodeData["sections"]) => {
        const rows = sections.flatMap((s) => s.rows);
        const updatedInteraction: ListNodeData["interaction"] = {
            mode: "input",
            input: {
                type: "choice",
                timeoutSeconds: data.interaction?.input?.timeoutSeconds ?? 3600,
                options: rows.map((r) => ({ id: r.id, label: r.title, branchKey: r.id })),
                defaultBranchKey: data.interaction?.input?.defaultBranchKey,
                variableName: data.interaction?.input?.variableName,
                variableScope: data.interaction?.input?.variableScope,
            },
        };
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id !== id) return node;
                const updatedNode = {
                    ...node,
                    data: { ...node.data, sections, interaction: updatedInteraction },
                };
                (updatedNode as any).branches = [
                    ...rows.map((r) => ({ key: r.id, label: r.title })),
                    { key: "timeout", label: "Timeout" },
                ];
                return updatedNode;
            })
        );
    };

    const updateData = (newData: Partial<ListNodeData>) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
            )
        );
    };

    const updateVariableSettings = (patch: Partial<{ variableName: string; variableScope: 'session' | 'contact' }>) => {
        const interaction = data.interaction || {
            mode: "input",
            input: {
                type: "choice",
                timeoutSeconds: 3600,
                options: allRows.map((r) => ({ id: r.id, label: r.title, branchKey: r.id })),
            },
        };
        updateData({
            interaction: {
                ...interaction,
                input: {
                    ...(interaction.input || { type: 'choice', timeoutSeconds: 3600, options: [] }),
                    ...patch
                }
            }
        });
    };

    const addSection = () => {
        if (isTranslationMode) return;
        const newId = `row_${Date.now()}`;
        const sections = [...(data.sections ?? []), { title: "Section", rows: [{ id: newId, title: "Option" }] }];
        syncBranchesAndInteraction(sections);
    };

    const removeSection = (si: number) => {
        if (isTranslationMode) return;
        const sections = (data.sections ?? []).filter((_, i) => i !== si);
        syncBranchesAndInteraction(sections);
    };

    const updateSectionTitle = (si: number, title: string) => {
        const sections = (data.sections ?? []).map((s, i) => i === si ? { ...s, title } : s);
        syncBranchesAndInteraction(sections);
    };

    const addRow = (si: number) => {
        if (isTranslationMode) return;
        const newId = `row_${Date.now()}`;
        const sections = (data.sections ?? []).map((s, i) =>
            i === si ? { ...s, rows: [...s.rows, { id: newId, title: "Option" }] } : s
        );
        syncBranchesAndInteraction(sections);
    };

    const removeRow = (si: number, ri: number) => {
        if (isTranslationMode) return;
        const sections = (data.sections ?? []).map((s, i) =>
            i === si ? { ...s, rows: s.rows.filter((_, j) => j !== ri) } : s
        );
        syncBranchesAndInteraction(sections);
    };

    const updateRowTitle = (si: number, ri: number, title: string) => {
        const sections = (data.sections ?? []).map((s, i) =>
            i === si ? { ...s, rows: s.rows.map((r, j) => j === ri ? { ...r, title } : r) } : s
        );
        syncBranchesAndInteraction(sections);
    };

    return (
        <NodeFrame
            selected={selected}
            id={id}
            icon={<ListIcon size={16} />}
            title={data.label || "List Message"}
            popoverTitle="Configure List"
            description={listNode.config.description}
            summary={data.body || "Click to configure list message..."}
            showPopover={selected}
            showBottomHandle={false}
            compactBody={
                <div className="flex flex-col gap-1.5 w-full mt-0.5">
                    {allRows.map((row) => (
                        <div key={row.id} className="relative bg-background rounded px-2 py-1 text-[10px] font-medium text-foreground border border-[var(--border-dim)] shadow-sm flex items-center">
                            <span className="truncate">{row.title || "Option"}</span>
                            <Handle
                                type="source"
                                id={row.id}
                                position={Position.Right}
                                className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-teal-500 border-2 border-background hover:scale-110 transition-transform"
                            />
                        </div>
                    ))}
                    <div className="relative bg-muted/10 rounded px-2 py-1 flex items-center">
                        <span className="truncate text-[9px] text-muted-foreground/50">Timeout</span>
                        <Handle
                            type="source"
                            id="timeout"
                            position={Position.Right}
                            className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground/30 border-2 border-background border-dashed"
                        />
                    </div>
                </div>
            }
            popoverContentClassName="p-4 space-y-6 min-w-[320px]"
            popoverBody={
                <>
                    {/* Header/Body */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                    <Type size={10} /> Body Message
                                </label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            The main content of the message. Max 1024 characters. You can use {"{{variable}}"} to personalize it.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <AutosizeTextarea
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.body}
                                placeholder="Type your message..."
                                onChange={(e) => updateData({ body: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Button Label</label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            The label on the button that the user clicks to open the list menu. Max 20 characters.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.buttonTitle || ""}
                                maxLength={20}
                                placeholder="View options"
                                onChange={(e) => updateData({ buttonTitle: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                    <Footprints size={10} /> Footer (Optional)
                                </label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            Small grey text that appears below the body message. Max 60 characters.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.footer || ""}
                                maxLength={60}
                                placeholder="Footer text..."
                                onChange={(e) => updateData({ footer: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="space-y-3 pt-4 border-t border-[var(--border-dim)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Sections & Options</label>
                                <TooltipProvider>
                                    <Tooltip delayDuration={300}>
                                        <TooltipTrigger asChild>
                                            <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                            Group your list options into sections. Max 24 chars for section/option titles, 72 chars for option descriptions.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            {!isTranslationMode && (
                                <button
                                    onClick={addSection}
                                    className="text-[10px] text-ey-yellow-text hover:underline font-bold"
                                >
                                    + Add Section
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {(data.sections ?? []).map((section: any, si: number) => (
                                <div key={`section-${si}`} className="rounded-xl border border-[var(--border-dim)] bg-muted/5 p-3 space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 bg-background rounded-md border border-[var(--border-dim)] px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                                            value={section.title}
                                            maxLength={24}
                                            placeholder="Section Title"
                                            onChange={(e) => updateSectionTitle(si, e.target.value)}
                                        />
                                        {!isTranslationMode && (
                                            <button onClick={() => removeSection(si)} className="text-muted-foreground hover:text-destructive">
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 pl-2">
                                        <SortableList
                                            items={section.rows}
                                            onReorder={(newRows: any[]) => {
                                                const newSections = (data.sections ?? []).map((s, i) =>
                                                    i === si ? { ...s, rows: newRows } : s
                                                );
                                                syncBranchesAndInteraction(newSections);
                                            }}
                                            keyExtractor={(row: any) => row.id}
                                            renderItem={(row: any, ri: number) => (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div className="w-1 h-1 rounded-full bg-teal-500 shrink-0" />
                                                    <div className="flex-1 flex flex-col gap-1">
                                                        <input
                                                            type="text"
                                                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                                                            value={row.title}
                                                            maxLength={24}
                                                            placeholder="Option Title"
                                                            onChange={(e) => updateRowTitle(si, ri, e.target.value)}
                                                        />
                                                        <input
                                                            type="text"
                                                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-2 py-0.5 text-[9px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                                                            value={row.description || ""}
                                                            maxLength={72}
                                                            placeholder="Optional Description (Max 72)"
                                                            onChange={(e) => {
                                                                const sections = (data.sections ?? []).map((s, i) =>
                                                                    i === si ? { ...s, rows: s.rows.map((r, j) => j === ri ? { ...r, description: e.target.value } : r) } : s
                                                                );
                                                                syncBranchesAndInteraction(sections);
                                                            }}
                                                        />
                                                    </div>
                                                    {!isTranslationMode && (
                                                        <button onClick={() => removeRow(si, ri)} className="text-muted-foreground hover:text-destructive">
                                                            <Trash2 size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        />
                                        {!isTranslationMode && (
                                            <button
                                                onClick={() => addRow(si)}
                                                className="text-[10px] text-teal-600 hover:underline font-medium pl-3"
                                            >
                                                + Add Option
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Variable Mapping */}
                    <div className="space-y-2 pt-4 border-t border-[var(--border-dim)]">
                        <div className="flex items-center gap-1.5">
                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                <MessageSquare size={10} /> Capture Response
                            </label>
                            <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                    <TooltipTrigger asChild>
                                        <Info className="size-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px] text-[10px]">
                                        Choose where to save the text of the option that the user selects.
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <VariableSelect
                                    value={data.interaction?.input?.variableName || ""}
                                    onValueChange={(val: string) => updateVariableSettings({ variableName: val })}
                                    placeholder="Select variable..."
                                />
                            </div>
                            <select
                                className="w-24 bg-background rounded-md border border-[var(--border-dim)] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                value={data.interaction?.input?.variableScope || 'session'}
                                onChange={(e) => updateVariableSettings({ variableScope: e.target.value as any })}
                            >
                                <option value="session">Session</option>
                                <option value="contact">Contact</option>
                            </select>
                        </div>
                    </div>
                </>
            }
        />
    );
}
