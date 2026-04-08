import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { ListChecks, X, Type, Footprints } from "lucide-react";
import type { ButtonsNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";

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
                    // Sync interaction options when buttons change
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
                    // Sync node-level branches with buttons for backend validation
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
        updateData({
            buttons: (data.buttons || []).filter(b => b.id !== btnId)
        });
    };

    const updateButtonTitle = (btnId: string, newTitle: string) => {
        updateData({
            buttons: (data.buttons || []).map(b => b.id === btnId ? { ...b, title: newTitle } : b)
        });
    };

    return (
        <div
            className={cn(
                "group relative min-w-[280px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
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
                    <div className="rounded-md bg-purple-500/10 p-1.5 text-purple-500">
                        <ListChecks size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Interactive Buttons
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Body Text */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Type size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Body Text</label>
                    </div>
                    <textarea
                        className="w-full min-h-[60px] bg-muted/50 rounded-xl border border-border/50 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                        value={data.body}
                        placeholder="Type your message..."
                        onChange={(e) => updateData({ body: e.target.value })}
                    />
                </div>

                {/* Footer Text */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Footprints size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Footer (Optional)</label>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.footer || ""}
                        placeholder="Footer text..."
                        onChange={(e) => updateData({ footer: e.target.value })}
                    />
                </div>

                {/* Buttons Editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Buttons ({(data.buttons || []).length}/3)</label>
                        {(data.buttons || []).length < 3 && (
                            <button
                                onClick={addButton}
                                className="text-[10px] text-primary hover:underline font-bold"
                            >
                                + Add Button
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {data.buttons?.map((button) => (
                            <div
                                key={button.id}
                                className="relative group/btn"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-muted/50 rounded-lg border border-border/50 py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center placeholder:text-muted-foreground/30"
                                        value={button.title}
                                        onChange={(e) => updateButtonTitle(button.id, e.target.value)}
                                    />
                                    <button
                                        onClick={() => removeButton(button.id)}
                                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover/btn:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                {/* Individual handle per button for branching */}
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={button.id}
                                    className="right-[-28px]! h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
                                />
                            </div>
                        ))}

                        {/* Timeout branch */}
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
                </div>

                {/* Variable capture */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Capture selection in variable</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <VariablesCombobox 
                            value={data.interaction?.input?.variableName || ""} 
                            onChange={(val) => updateVariableSettings({ variableName: val })} 
                            placeholder="e.g. choice_key" 
                        />
                        <select
                            className="bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            value={data.interaction?.input?.variableScope || 'session'}
                            onChange={(e) => updateVariableSettings({ variableScope: e.target.value as 'session' | 'contact' })}
                        >
                            <option value="session">Session</option>
                            <option value="contact">Contact</option>
                        </select>
                    </div>
                    <p className="text-[10px] text-muted-foreground">We'll store both the option ID and its label (using <code>_label</code> suffix).</p>
                </div>
            </div>

            {/* Visual background element */}
            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-purple-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
