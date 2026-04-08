import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Layout, X, Type, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import type { CardsNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";

export function CardsNodeRenderer({ id, data, selected }: NodeProps & { data: CardsNodeData }) {
    const { setNodes } = useReactFlow();

    const updateData = (newData: Partial<CardsNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    const mergedData = { ...node.data, ...newData };
                    
                    // Sync node-level branches with buttons from all cards for backend validation
                    const items = mergedData.items ?? [];
                    const allButtons = items.flatMap((item: any) => item.buttons ?? []);
                    const updatedNode: typeof node = { ...node, data: mergedData };
                    (updatedNode as any).branches = [
                        ...allButtons.map((b: { id: string; text: string; branchKey: string }) => ({
                            key: b.branchKey,
                            label: b.text,
                        })),
                        { key: 'timeout', label: 'Timeout' },
                    ];
                    return updatedNode;
                }
                return node;
            })
        );
    };

    const addCard = () => {
        const newCard = {
            id: `card_${Date.now()}`,
            title: "New Card",
            description: "Description",
            buttons: [{ id: `btn_${Date.now()}`, text: "Button 1", branchKey: `branch_${Date.now()}` }],
        };
        updateData({ items: [...(data.items || []), newCard] });
    };

    const removeCard = (cardId: string) => {
        if (data.items.length > 1) {
            updateData({ items: data.items.filter(item => item.id !== cardId) });
        }
    };

    const updateCard = (cardId: string, patch: any) => {
        updateData({
            items: data.items.map(item => item.id === cardId ? { ...item, ...patch } : item)
        });
    };

    const addCardButton = (cardId: string) => {
        const card = data.items.find(item => item.id === cardId);
        if (card && (card.buttons || []).length < 3) {
            const newButtons = [
                ...(card.buttons || []),
                { id: `btn_${Date.now()}`, text: "New Button", branchKey: `branch_${Date.now()}` }
            ];
            updateCard(cardId, { buttons: newButtons });
        }
    };

    const removeCardButton = (cardId: string, btnId: string) => {
        const card = data.items.find(item => item.id === cardId);
        if (card) {
            updateCard(cardId, {
                buttons: card.buttons.filter((b: any) => b.id !== btnId)
            });
        }
    };

    const updateButtonText = (cardId: string, btnId: string, text: string) => {
        const card = data.items.find(item => item.id === cardId);
        if (card) {
            updateCard(cardId, {
                buttons: card.buttons.map((b: any) => b.id === btnId ? { ...b, text } : b)
            });
        }
    };

    const updateVariableSettings = (patch: any) => {
        updateData({
            interaction: {
                ...data.interaction,
                input: {
                    ...(data.interaction?.input || { timeoutSeconds: 300, variableScope: 'session' }),
                    ...patch
                }
            }
        });
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

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500">
                        <Layout size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Cards Sequence
                    </span>
                </div>
                <button
                    onClick={addCard}
                    className="rounded-full p-1 hover:bg-muted transition-colors text-primary"
                    title="Add Card"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Cards List */}
                <div className="space-y-4">
                    {data.items?.map((item, index) => (
                        <div key={item.id} className="relative space-y-3 rounded-xl border border-border/40 bg-muted/20 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-medium text-muted-foreground uppercase">Card {index + 1}</span>
                                {data.items.length > 1 && (
                                    <button onClick={() => removeCard(item.id)} className="text-muted-foreground hover:text-destructive">
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Image URL */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <ImageIcon size={10} className="text-muted-foreground" />
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Image URL</label>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-lg border border-border/50 px-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={item.imageUrl || ""}
                                    placeholder="https://..."
                                    onChange={(e) => updateCard(item.id, { imageUrl: e.target.value })}
                                />
                            </div>

                            {/* Title */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                    <Type size={10} className="text-muted-foreground" />
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Title</label>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-lg border border-border/50 px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={item.title || ""}
                                    placeholder="Card Title"
                                    onChange={(e) => updateCard(item.id, { title: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-1">
                                <textarea
                                    className="w-full min-h-[40px] bg-background rounded-lg border border-border/50 p-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                    value={item.description || ""}
                                    placeholder="Description..."
                                    onChange={(e) => updateCard(item.id, { description: e.target.value })}
                                />
                            </div>

                            {/* Buttons per card */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Buttons ({item.buttons?.length || 0}/3)</label>
                                    {(item.buttons?.length || 0) < 3 && (
                                        <button onClick={() => addCardButton(item.id)} className="text-[10px] text-primary hover:underline font-bold">
                                            + Add
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {item.buttons?.map((btn: any) => (
                                        <div key={btn.id} className="relative group/btn">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 bg-background rounded-lg border border-border/50 py-1.5 px-3 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                                                    value={btn.text}
                                                    onChange={(e) => updateButtonText(item.id, btn.id, e.target.value)}
                                                />
                                                <button onClick={() => removeCardButton(item.id, btn.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover/btn:opacity-100 transition-opacity">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                            <Handle
                                                type="source"
                                                position={Position.Right}
                                                id={btn.branchKey}
                                                className="right-[-32px]! h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Variable capture */}
                {data.interaction?.mode === 'input' && (
                    <div className="space-y-3 pt-2 border-t border-border/50">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Capture selection</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <VariablesCombobox 
                                    value={data.interaction?.input?.variableName || ""} 
                                    onChange={(val) => updateVariableSettings({ variableName: val })} 
                                    placeholder="e.g. choice" 
                                />
                                <select
                                    className="bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    value={data.interaction?.input?.variableScope || 'session'}
                                    onChange={(e) => updateVariableSettings({ variableScope: e.target.value })}
                                >
                                    <option value="session">Session</option>
                                    <option value="contact">Contact</option>
                                </select>
                            </div>
                        </div>

                        {/* Timeout branch */}
                        <div className="relative flex items-center justify-center rounded-lg border border-dashed border-border bg-transparent py-2 px-3 text-[10px] text-muted-foreground">
                            Timeout fallback
                            <Handle
                                type="source"
                                position={Position.Right}
                                id="timeout"
                                className="right-[-32px]! h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Visual background element */}
            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-blue-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
