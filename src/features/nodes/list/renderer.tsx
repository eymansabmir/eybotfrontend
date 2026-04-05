import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { List as ListIcon, Plus, Trash2, MessageSquare } from "lucide-react";
import type { ListNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";

export function ListNodeRenderer({ id, data, selected }: NodeProps & { data: ListNodeData }) {
    const { setNodes } = useReactFlow();

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
        const newId = `row_${Date.now()}`;
        const sections = [...(data.sections ?? []), { title: "Section", rows: [{ id: newId, title: "Option" }] }];
        syncBranchesAndInteraction(sections);
    };

    const removeSection = (si: number) => {
        const sections = (data.sections ?? []).filter((_, i) => i !== si);
        syncBranchesAndInteraction(sections);
    };

    const updateSectionTitle = (si: number, title: string) => {
        const sections = (data.sections ?? []).map((s, i) => i === si ? { ...s, title } : s);
        syncBranchesAndInteraction(sections);
    };

    const addRow = (si: number) => {
        const newId = `row_${Date.now()}`;
        const sections = (data.sections ?? []).map((s, i) =>
            i === si ? { ...s, rows: [...s.rows, { id: newId, title: "Option" }] } : s
        );
        syncBranchesAndInteraction(sections);
    };

    const removeRow = (si: number, ri: number) => {
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
        <div
            className={cn(
                "group relative min-w-[300px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-500">
                        <ListIcon size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        List Message
                    </span>
                </div>
                <button
                    onClick={addSection}
                    className="flex items-center gap-1 rounded-lg bg-teal-500/10 px-2 py-1 text-[9px] font-bold text-teal-600 hover:bg-teal-500/20 transition-colors"
                >
                    <Plus size={9} /> Section
                </button>
            </div>

            <div className="p-4 space-y-3">
                {/* Body */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Body Text</label>
                    <textarea
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        rows={2}
                        value={data.body || ""}
                        placeholder="Choose an option below..."
                        onChange={(e) => updateData({ body: e.target.value })}
                    />
                </div>

                {/* Button Title */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Button Label</label>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.buttonTitle || ""}
                        placeholder="View options"
                        onChange={(e) => updateData({ buttonTitle: e.target.value })}
                    />
                </div>

                {/* Sections with per-row branch handles */}
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                        Sections ({allRows.length} rows)
                    </label>

                    {(data.sections ?? []).map((section, si) => (
                        <div key={si} className="rounded-xl border border-border/50 bg-muted/20 p-2.5 space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-background/60 rounded-lg border border-border/50 px-2 py-1.5 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-primary/20"
                                    value={section.title}
                                    placeholder="Section title"
                                    onChange={(e) => updateSectionTitle(si, e.target.value)}
                                />
                                <button
                                    onClick={() => removeSection(si)}
                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>

                            {section.rows.map((row, ri) => (
                                <div key={row.id} className="relative flex items-center gap-1.5 pl-2 pr-8">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500/60 shrink-0" />
                                    <input
                                        type="text"
                                        className="flex-1 bg-background/60 rounded-lg border border-border/50 px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                                        value={row.title}
                                        placeholder="Option label"
                                        onChange={(e) => updateRowTitle(si, ri, e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeRow(si, ri)}
                                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                    {/* Per-row branch handle */}
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={row.id}
                                        className="right-[-28px]! h-4 w-4 border-2 border-background bg-teal-500 shadow-sm hover:scale-125 transition-transform"
                                    />
                                </div>
                            ))}

                            <button
                                onClick={() => addRow(si)}
                                className="flex items-center gap-1 pl-2 text-[9px] text-teal-600 hover:text-teal-700 font-medium transition-colors"
                            >
                                <Plus size={9} /> Add row
                            </button>
                        </div>
                    ))}

                    {(data.sections ?? []).length === 0 && (
                        <div className="flex items-center justify-center rounded-xl border border-dashed border-border/50 py-4 text-[10px] text-muted-foreground italic">
                            Click "+ Section" to add options
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Footer (optional)</label>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.footer || ""}
                        placeholder="Powered by our bot"
                        onChange={(e) => updateData({ footer: e.target.value })}
                    />
                </div>

                {/* Variable capture */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <MessageSquare size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Capture selection in</label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <VariablesCombobox 
                                value={data.interaction?.input?.variableName || ""} 
                                onChange={(val) => updateVariableSettings({ variableName: val })} 
                                placeholder="variable_name" 
                            />
                            <select
                                className="bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                value={data.interaction?.input?.variableScope || "session"}
                                onChange={(e) => updateVariableSettings({ variableScope: e.target.value as any })}
                            >
                                <option value="session">Session</option>
                                <option value="contact">Contact</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Timeout branch row */}
                <div className="relative flex items-center justify-center rounded-lg border border-dashed border-border bg-transparent py-2 px-3 text-[10px] text-muted-foreground">
                    Timeout (1hr)
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="timeout"
                        className="right-[-28px]! h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                    />
                </div>
            </div>

            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-teal-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
