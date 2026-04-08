import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Layout, X, Type, Image as ImageIcon, Video, Plus, ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import type { CarouselNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { VariablesCombobox } from "@/features/variables/components/variables-combobox";

export function CarouselNodeRenderer({ id, data, selected }: NodeProps & { data: CarouselNodeData }) {
    const { setNodes } = useReactFlow();
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    const updateData = (newData: Partial<CarouselNodeData>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    const mergedData = { ...node.data, ...newData };

                    const updatedNode: typeof node = { ...node, data: mergedData };

                    // Sync branches with the first card's quick reply buttons (since they are now global)
                    const firstCard = (mergedData.cards || [])[0];
                    if (firstCard) {
                        mergedData.cards = (mergedData.cards || []).map(card => ({
                            ...card,
                            buttonType: firstCard.buttonType,
                            ctaUrlButton: firstCard.ctaUrlButton,
                            quickReplyButtons: firstCard.quickReplyButtons,
                        }));
                    }

                    const quickReplies = firstCard?.buttonType === 'quick_reply' ? (firstCard.quickReplyButtons || []) : [];

                    // Ensure interaction object exists for choice nodes
                    if (quickReplies.length > 0 && (!mergedData.interaction || !mergedData.interaction.input)) {
                        mergedData.interaction = {
                            mode: 'input',
                            input: {
                                type: 'choice',
                                timeoutSeconds: 3600,
                                options: []
                            }
                        };
                    }

                    // Sync interaction options for the engine
                    if (mergedData.interaction?.input?.type === 'choice') {
                        mergedData.interaction = {
                            ...mergedData.interaction,
                            input: {
                                ...mergedData.interaction.input,
                                options: quickReplies.map(btn => ({
                                    id: btn.id,
                                    label: btn.title,
                                    branchKey: btn.id,
                                })),
                            },
                        };
                    }

                    (updatedNode as any).branches = [
                        ...quickReplies.map(btn => ({
                            key: btn.id,
                            label: btn.title,
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
        if ((data.cards || []).length < 10) {
            const newCards = [
                ...(data.cards || []),
                {
                    headerType: 'image' as const,
                    url: 'https://example.com/image.jpg',
                    bodyText: 'New Card Content',
                    buttonType: 'cta_url' as const,
                    ctaUrlButton: { displayText: 'Open Link', url: 'https://example.com' }
                }
            ];
            updateData({ cards: newCards });
            setActiveCardIndex(newCards.length - 1);
        }
    };

    const removeCard = (index: number) => {
        const newCards = (data.cards || []).filter((_, i) => i !== index);
        updateData({ cards: newCards });
        if (activeCardIndex >= newCards.length) {
            setActiveCardIndex(Math.max(0, newCards.length - 1));
        }
    };

    const updateCard = (index: number, patch: any) => {
        const newCards = (data.cards || []).map((card, i) =>
            i === index ? { ...card, ...patch } : card
        );
        updateData({ cards: newCards });
    };

    const activeCard = data.cards?.[activeCardIndex];

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
                    <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500">
                        <Layout size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Interactive Carousel
                    </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <span>{activeCardIndex + 1} / {(data.cards || []).length}</span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Carousel Body Text (Optional) */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <Type size={10} className="text-muted-foreground" />
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Main Body Text (Optional)</label>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={data.bodyText || ""}
                        placeholder="Choose an option below:"
                        onChange={(e) => updateData({ bodyText: e.target.value })}
                    />
                </div>

                {/* Validation Warning */}
                {(data.cards || []).length < 2 && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-2">
                        <AlertCircle size={14} className="text-yellow-600 dark:text-yellow-500 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-medium text-yellow-800 dark:text-yellow-400">Minimum 2 cards required</p>
                            <p className="text-[10px] text-yellow-800/70 dark:text-yellow-400/70">WhatsApp requires at least 2 cards to display a carousel.</p>
                        </div>
                    </div>
                )}

                {/* Card Navigation & Management */}
                <div className="flex items-center justify-between gap-2 bg-muted/20 p-2 rounded-xl border border-border/50">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeCardIndex === 0}
                            className="p-1 hover:bg-background rounded-md disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setActiveCardIndex(prev => Math.min((data.cards?.length || 1) - 1, prev + 1))}
                            disabled={activeCardIndex === (data.cards?.length || 1) - 1}
                            className="p-1 hover:bg-background rounded-md disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                        {data.cards?.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveCardIndex(i)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    activeCardIndex === i ? "bg-primary w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-1">
                        {(data.cards || []).length > 2 && (
                            <button
                                onClick={() => removeCard(activeCardIndex)}
                                className="p-1 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                        {(data.cards || []).length < 10 && (
                            <button
                                onClick={addCard}
                                className="p-1 text-primary hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Card Editor */}
                {activeCard && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Header Type & URL */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Card Media</label>
                                <div className="flex bg-muted/50 rounded-lg p-0.5 border border-border/50">
                                    <button
                                        onClick={() => updateCard(activeCardIndex, { headerType: 'image' })}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                                            activeCard.headerType === 'image' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <ImageIcon size={10} /> Image
                                    </button>
                                    <button
                                        onClick={() => updateCard(activeCardIndex, { headerType: 'video' })}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                                            activeCard.headerType === 'video' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Video size={10} /> Video
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="w-full bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                value={activeCard.url}
                                placeholder="https://..."
                                onChange={(e) => updateCard(activeCardIndex, { url: e.target.value })}
                            />
                        </div>

                        {/* Card Body */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                                <Type size={10} className="text-muted-foreground" />
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Card Body (max 160)</label>
                            </div>
                            <textarea
                                className="w-full min-h-[60px] bg-muted/50 rounded-xl border border-border/50 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                value={activeCard.bodyText || ""}
                                placeholder="Describe this option..."
                                maxLength={160}
                                onChange={(e) => updateCard(activeCardIndex, { bodyText: e.target.value })}
                            />
                        </div>

                        {/* Button Configuration */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Card Action</label>
                                <select
                                    className="bg-muted/50 rounded-lg px-2 py-1 text-[10px] border border-border/50 focus:outline-none"
                                    value={activeCard.buttonType || 'cta_url'}
                                    onChange={(e) => {
                                        const newType = e.target.value as any;
                                        const newCards = (data.cards || []).map(card => ({
                                            ...card,
                                            buttonType: newType,
                                            // Sync quick replies across all cards if switching to quick_reply
                                            quickReplyButtons: newType === 'quick_reply' && (!card.quickReplyButtons || card.quickReplyButtons.length === 0)
                                                ? [{ id: `qr_${Date.now()}`, title: 'Quick Reply' }]
                                                : card.quickReplyButtons
                                        }));
                                        updateData({ cards: newCards });
                                    }}
                                >
                                    <option value="cta_url">CTA (Link)</option>
                                    <option value="quick_reply">Quick Reply</option>
                                </select>
                            </div>

                            {activeCard.buttonType === 'cta_url' ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        className="bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                                        value={activeCard.ctaUrlButton?.displayText || ""}
                                        placeholder="Button Text"
                                        onChange={(e) => updateCard(activeCardIndex, {
                                            ctaUrlButton: { ...activeCard.ctaUrlButton, displayText: e.target.value }
                                        })}
                                    />
                                    <input
                                        type="text"
                                        className="bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        value={activeCard.ctaUrlButton?.url || ""}
                                        placeholder="URL"
                                        onChange={(e) => updateCard(activeCardIndex, {
                                            ctaUrlButton: { ...activeCard.ctaUrlButton, url: e.target.value }
                                        })}
                                    />
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id="default"
                                        className="right-[-28px]! h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {(activeCard.quickReplyButtons || []).map((btn: any, btnIdx: number) => (
                                        <div key={btn.id} className="relative">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    className="flex-1 bg-muted/50 rounded-lg border border-border/50 py-2 px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-center"
                                                    value={btn.title}
                                                    onChange={(e) => {
                                                        const newCards = (data.cards || []).map(card => ({
                                                            ...card,
                                                            quickReplyButtons: (card.quickReplyButtons || []).map((b: any, i: number) =>
                                                                i === btnIdx ? { ...b, title: e.target.value } : b
                                                            )
                                                        }));
                                                        updateData({ cards: newCards });
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newCards = (data.cards || []).map(card => ({
                                                            ...card,
                                                            quickReplyButtons: (card.quickReplyButtons || []).filter((_: any, i: number) => i !== btnIdx)
                                                        }));
                                                        updateData({ cards: newCards });
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                            <Handle
                                                type="source"
                                                position={Position.Right}
                                                id={btn.id}
                                                className="right-[-28px]! h-4 w-4 border-2 border-background bg-primary shadow-sm hover:scale-125 transition-transform"
                                            />
                                        </div>
                                    ))}
                                    {(activeCard.quickReplyButtons || []).length < 2 && (
                                        <button
                                            onClick={() => {
                                                const timestamp = Date.now();
                                                const newCards = (data.cards || []).map((card) => ({
                                                    ...card,
                                                    quickReplyButtons: [
                                                        ...(card.quickReplyButtons || []),
                                                        { id: `qr_${timestamp}`, title: 'Quick Reply' }
                                                    ]
                                                }));
                                                updateData({ cards: newCards });
                                            }}
                                            className="w-full py-1.5 border border-dashed border-border rounded-lg text-[10px] text-muted-foreground hover:bg-muted/30 transition-all"
                                        >
                                            + Add Quick Reply
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Interaction Settings */}
                <div className="pt-2 border-t border-border/50 space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                            <MessageSquare size={10} className="text-muted-foreground" />
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Capture selection in</label>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <VariablesCombobox 
                                value={data.interaction?.input?.variableName || ""} 
                                onChange={(val) => {
                                    const interaction = data.interaction || { mode: 'input', input: { type: 'choice' as const, timeoutSeconds: 3600 } };
                                    updateData({
                                        interaction: {
                                            ...interaction,
                                            input: { ...interaction.input, type: 'choice' as const, variableName: val }
                                        }
                                    });
                                }} 
                                placeholder="variable_name" 
                            />
                            <select
                                className="bg-muted/50 rounded-xl border border-border/50 px-3 py-2 text-[11px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={data.interaction?.input?.variableScope || "session"}
                                onChange={(e) => {
                                    const interaction = data.interaction || { mode: 'input', input: { type: 'choice' as const, timeoutSeconds: 3600 } };
                                    updateData({
                                        interaction: {
                                            ...interaction,
                                            input: { ...interaction.input, type: 'choice' as const, variableScope: e.target.value as any }
                                        }
                                    });
                                }}
                            >
                                <option value="session">Session</option>
                                <option value="contact">Contact</option>
                            </select>
                        </div>
                    </div>

                    {/* Global Timeout */}
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

            {/* Indicator of cards */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1">
                {data.cards?.map((_, i) => (
                    <div key={i} className={cn("w-1.5 h-1.5 rounded-full", activeCardIndex === i ? "bg-primary" : "bg-muted-foreground/20")} />
                ))}
            </div>

            {/* Visual background element */}
            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-blue-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
