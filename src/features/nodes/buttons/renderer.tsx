import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { ListChecks, X, Type, Footprints } from "lucide-react";
import type { ButtonsNodeData } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { SortableList } from "@/components/ui/sortable-list";
import { VariableSelect } from "@/features/variables/components/variable-select";

type Interaction = NonNullable<ButtonsNodeData["interaction"]>;

export function ButtonsNodeRenderer({ id, data, selected }: NodeProps & { data: ButtonsNodeData }) {
    const { setNodes } = useReactFlow();

    const ensureInteraction = (nodeData: ButtonsNodeData): Interaction => {
        const baseOptions = nodeData.buttons?.map((b) => ({ id: b.id, label: b.title, branchKey: b.id })) ?? [];
        const interaction: Interaction = nodeData.interaction ?? {
            mode: 'input',
            input: {
                type: 'choice',
                timeoutSeconds: 3600,
                options: baseOptions,
            },
        };

        const input = interaction.input ?? {
            type: 'choice',
            timeoutSeconds: 3600,
            options: baseOptions,
        };

        interaction.mode = interaction.mode ?? 'input';
        interaction.input = {
            ...input,
            timeoutSeconds: input.timeoutSeconds ?? 3600,
            type: 'choice',
            options: input.options ?? baseOptions,
            variableScope: input.variableScope ?? 'session',
        };

        return interaction;
    };

    const updateData = (newData: Partial<ButtonsNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    const mergedData = { ...node.data, ...newData };
                    if (newData.buttons && mergedData.interaction?.input?.type === 'choice') {
                        mergedData.interaction = {
                            ...mergedData.interaction,
                            input: {
                                ...mergedData.interaction.input,
                                options: newData.buttons.map((b: { id: string; title: string }) => ({
                                    id: b.id,
                                    label: b.title,
                                    branchKey: b.id,
                                })),
                            },
                        };
                    }
                    const updatedNode: typeof node = { ...node, data: mergedData };
                    if (newData.buttons) {
                        (updatedNode as any).branches = [
                            ...newData.buttons.map((b: { id: string; title: string }) => ({
                                key: b.id,
                                label: b.title,
                            })),
                            { key: 'timeout', label: 'Timeout' },
                        ];
                    }
                    return updatedNode;
                }
                return node;
            })
        );
    };

    const updateVariableSettings = (patch: Partial<{ variableName: string; variableScope: 'session' | 'contact' }>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id !== id) return node;
                const interaction = ensureInteraction(node.data as ButtonsNodeData);
                interaction.input = interaction.input
                    ? { ...interaction.input, ...patch }
                    : { type: 'choice', timeoutSeconds: 3600, variableScope: 'session', options: [], ...patch };
                return {
                    ...node,
                    data: {
                        ...node.data,
                        interaction,
                    },
                };
            })
        );
    };

    const addButton = () => {
        if ((data.buttons || []).length < 3) {
            const newButtons = [
                ...(data.buttons || []),
                { id: `btn_${Date.now()}`, title: "New Button" }
            ];
            updateData({ buttons: newButtons });
        }
    };

    const removeButton = (btnId: string) => {
        updateData({ buttons: (data.buttons || []).filter(b => b.id !== btnId) });
    };

    const updateButtonTitle = (btnId: string, newTitle: string) => {
        updateData({ buttons: (data.buttons || []).map(b => b.id === btnId ? { ...b, title: newTitle } : b) });
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<ListChecks size={16} />}
            title="Interactive Buttons"
            popoverTitle="Configure Buttons"
            summary={data.body ? data.body : "Configure button message"}
            showPopover={selected}
            showBottomHandle={false}
            compactBody={
                <div className="flex flex-col gap-1.5 w-full mt-0.5">
                    {data.buttons?.map((b) => (
                        <div key={b.id} className="relative bg-background rounded px-2 py-1 text-[10px] font-medium text-foreground border border-[var(--border-dim)] shadow-sm flex items-center">
                            <span className="truncate">{b.title || "Unnamed"}</span>
                            <Handle
                                type="source"
                                id={b.id}
                                position={Position.Right}
                                className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground border-2 border-background hover:bg-[var(--ey-yellow)] transition-colors"
                            />
                        </div>
                    ))}
                    <div className="relative bg-muted/10 rounded px-2 py-1 flex items-center">
                        <span className="truncate text-[9px] text-muted-foreground/50">Timeout Branch</span>
                        <Handle
                            type="source"
                            id="timeout"
                            position={Position.Right}
                            className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground/30 border-2 border-background border-dashed"
                        />
                    </div>
                </div>
            }
            popoverContentClassName="p-4 space-y-5"
            popoverBody={
                <>
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Type size={10} /> Body Message
                        </label>
                        <AutosizeTextarea
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.body}
                            placeholder="Type your message..."
                            onChange={(e) => updateData({ body: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Footprints size={10} /> Footer (Optional)
                        </label>
                        <input
                            type="text"
                            className="w-full bg-background rounded-lg border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.footer || ""}
                            placeholder="Footer text..."
                            onChange={(e) => updateData({ footer: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Buttons ({(data.buttons || []).length}/3)</label>
                            {(data.buttons || []).length < 3 && (
                                <button
                                    onClick={addButton}
                                    className="text-[10px] text-ey-yellow-text hover:underline font-bold"
                                >
                                    + Add Button
                                </button>
                            )}
                        </div>

                        <SortableList
                            items={data.buttons || []}
                            onReorder={(newButtons: any[]) => updateData({ buttons: newButtons })}
                            keyExtractor={(b: any) => b.id}
                            renderItem={(button: any) => (
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        type="text"
                                        className="flex-1 bg-background rounded-md border border-[var(--border-dim)] py-1.5 px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all text-center"
                                        value={button.title}
                                        onChange={(e) => updateButtonTitle(button.id, e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeButton(button.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        />
                    </div>

                    <div className="rounded-lg bg-muted/20 border border-[var(--border-dim)] p-3 space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Capture Response</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <VariableSelect
                                    value={data.interaction?.input?.variableName || ""}
                                    onValueChange={(val) => updateVariableSettings({ variableName: val })}
                                    placeholder="Save to variable..."
                                />
                            </div>
                            <select
                                className="w-24 bg-background rounded-md border border-[var(--border-dim)] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] cursor-pointer h-8 transition-all"
                                value={data.interaction?.input?.variableScope || 'session'}
                                onChange={(e) => updateVariableSettings({ variableScope: e.target.value as 'session' | 'contact' })}
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
