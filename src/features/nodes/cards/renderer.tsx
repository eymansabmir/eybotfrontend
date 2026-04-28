import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Layout, X, Type, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import type { CardsNodeData } from "./schema";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { SortableList } from "@/components/ui/sortable-list";

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
        <NodeFrame
            selected={selected}
            icon={<Layout size={16} />}
            title="Cards Message"
            popoverTitle="Configure Cards"
            summary={`${(data.items || []).length} Cards attached`}
            showPopover={selected}
            showBottomHandle={false}
            popoverClassName="w-[360px]"
            extraPopoverHeader={
                <button
                    onClick={addCard}
                    className="rounded bg-[var(--ey-yellow)] text-black px-2 py-1 text-[10px] font-bold shadow-sm hover:brightness-95 transition-all flex items-center gap-1"
                >
                    <Plus size={12} /> Add Card
                </button>
            }
            compactBody={
                <div className="flex flex-col gap-1 w-full mt-1">
                    {/* Render branches dynamically from the cards for quick linking */}
                    {(data.items || []).flatMap((c:any) => c.buttons || []).slice(0, 3).map((btn: any) => (
                        <div key={btn.id} className="relative bg-background rounded px-2 py-1 text-[10px] font-medium text-foreground border border-[var(--border-dim)] shadow-sm truncate">
                            <span className="pr-2">{btn.text || "Button"}</span>
                            <Handle 
                                type="source" 
                                id={btn.branchKey} 
                                position={Position.Right} 
                                className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground border-2 border-background hover:bg-primary transition-colors" 
                            />
                        </div>
                    ))}
                    {(data.items || []).flatMap((c:any) => c.buttons || []).length > 3 && (
                        <div className="text-[9px] text-muted-foreground italic text-center py-0.5">
                            + {data.items.flatMap((c:any) => c.buttons || []).length - 3} more option(s)
                        </div>
                    )}
                    
                    {data.interaction?.mode === 'input' && (
                        <div className="relative bg-muted/10 rounded px-2 py-1 text-[9px] font-medium text-muted-foreground border border-dashed border-[var(--border-dim)] mt-1">
                            <span className="pr-2">Timeout</span>
                            <Handle 
                                type="source" 
                                id="timeout" 
                                position={Position.Right} 
                                className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground/50 border-2 border-background hover:bg-red-400 transition-colors" 
                            />
                        </div>
                    )}
                </div>
            }
            popoverBody={
                <div className="space-y-4">
                    <div className="space-y-4">
                    <div className="space-y-4">
                        {(data.items ?? []).map((item: any, index: number) => (
                            <div key={item.id} className="relative space-y-3 rounded-xl border border-[var(--border-dim)] bg-muted/10 p-3 flex-1">
                                <div className="flex items-center justify-between border-b border-[var(--border-dim)] pb-2 mb-2">
                                    <span className="text-[10px] font-bold text-foreground">Card {index + 1}</span>
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
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Image URL or Variable</label>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={item.imageUrl || ""}
                                        placeholder="https://... or {{var}}"
                                        onChange={(e) => updateCard(item.id, { imageUrl: e.target.value })}
                                    />
                                    {item.imageUrl?.includes("{{") && (
                                        <p className="text-[8px] text-primary italic">Supports dynamic variables</p>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <Type size={10} className="text-muted-foreground" />
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Title</label>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-1.5 text-[11px] font-bold focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={item.title || ""}
                                        placeholder="Card Title"
                                        onChange={(e) => updateCard(item.id, { title: e.target.value })}
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-1">
                                    <AutosizeTextarea
                                        className="w-full bg-background rounded-md border border-[var(--border-dim)] p-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={item.description || ""}
                                        placeholder="Description..."
                                        onChange={(e) => updateCard(item.id, { description: e.target.value })}
                                    />
                                </div>

                                {/* Buttons per card */}
                                <div className="space-y-2 pt-2 border-t border-[var(--border-dim)]">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Buttons ({item.buttons?.length || 0}/3)</label>
                                        {(item.buttons?.length || 0) < 3 && (
                                            <button onClick={() => addCardButton(item.id)} className="text-[10px] text-ey-yellow-text hover:underline font-bold">
                                                + Add
                                            </button>
                                        )}
                                    </div>
                                    <SortableList
                                        items={item.buttons || []}
                                        onReorder={(newButtons: any[]) => updateCard(item.id, { buttons: newButtons })}
                                        keyExtractor={(btn: any) => btn.id}
                                        renderItem={(btn: any) => (
                                            <div className="group/btn flex items-center gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    className="flex-1 bg-background rounded-md border border-[var(--border-dim)] py-1.5 px-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all text-center"
                                                    value={btn.text}
                                                    onChange={(e) => updateButtonText(item.id, btn.id, e.target.value)}
                                                />
                                                <button onClick={() => removeCardButton(item.id, btn.id)} className="text-muted-foreground hover:text-destructive p-1 shrink-0">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>

                    {/* Variable capture */}
                    {data.interaction?.mode === 'input' && (
                        <div className="space-y-2 mt-4 pt-4 border-t border-[var(--border-dim)]">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Capture selection to variable</label>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        className="bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={data.interaction?.input?.variableName || ""}
                                        placeholder="e.g. choice"
                                        onChange={(e) => updateVariableSettings({ variableName: e.target.value })}
                                    />
                                    <select
                                        className="bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                        value={data.interaction?.input?.variableScope || 'session'}
                                        onChange={(e) => updateVariableSettings({ variableScope: e.target.value })}
                                    >
                                        <option value="session">Session</option>
                                        <option value="contact">Contact</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
}
