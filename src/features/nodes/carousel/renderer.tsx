import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Layout, X, Type, Image as ImageIcon, Video, Plus, ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from "lucide-react";
import type { CarouselNodeData } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

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
                                })) as any,
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
        <NodeFrame
            selected={selected}
            icon={<Layout size={16} />}
            title="Carousel"
            popoverTitle="Configure Carousel"
            summary={`${(data.cards || []).length} Cards attached`}
            showPopover={selected}
            showBottomHandle={false}
            popoverClassName="w-[360px]"
            compactBody={
                <div className="flex flex-col gap-1 w-full mt-1">
                    {/* Render branches dynamically from the first card's quick replies, if applicable */}
                    {((data.cards || [])[0]?.buttonType === 'quick_reply') && (data.cards || [])[0]?.quickReplyButtons?.slice(0, 3).map((btn: any) => (
                        <div key={btn.id} className="relative bg-background rounded px-2 py-1 text-[10px] font-medium text-foreground border border-[var(--border-dim)] shadow-sm truncate">
                            <span className="pr-2">{btn.title}</span>
                            <Handle 
                                type="source" 
                                id={btn.id} 
                                position={Position.Right} 
                                className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground border-2 border-background hover:bg-primary transition-colors" 
                            />
                        </div>
                    ))}
                    {((data.cards || [])[0]?.buttonType === 'quick_reply') && ((data.cards || [])[0]?.quickReplyButtons?.length || 0) > 3 && (
                        <div className="text-[9px] text-muted-foreground italic text-center py-0.5">
                            + {((data.cards || [])[0]?.quickReplyButtons?.length || 0) - 3} more
                        </div>
                    )}

                    {((data.cards || [])[0]?.buttonType !== 'quick_reply') && (
                        <div className="relative bg-background rounded px-2 py-1 text-[10px] font-medium text-foreground border border-[var(--border-dim)] shadow-sm truncate">
                            <span className="pr-2">Default Next Step</span>
                            <Handle 
                                type="source" 
                                id="default" 
                                position={Position.Right} 
                                className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground border-2 border-background hover:bg-primary transition-colors" 
                            />
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
                    {/* Carousel Body Text (Optional) */}
                    <div className="space-y-1.5 flex flex-col items-center">
                        <div className="flex items-center gap-1.5 w-full mb-1">
                            <Type size={10} className="text-muted-foreground" />
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Main Body Text (Optional)</label>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                            value={data.bodyText || ""}
                            placeholder="Choose an option below:"
                            onChange={(e) => updateData({ bodyText: e.target.value })}
                        />
                    </div>

                    {/* Validation Warning */}
                    {(data.cards || []).length < 2 && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md flex items-start gap-2">
                            <AlertCircle size={14} className="text-yellow-600 dark:text-yellow-500 mt-0.5 stretch-0" />
                            <div>
                                <p className="text-[11px] font-medium text-yellow-800 dark:text-yellow-400">Minimum 2 cards required</p>
                                <p className="text-[10px] text-yellow-800/70 dark:text-yellow-400/70">WhatsApp requires at least 2 cards.</p>
                            </div>
                        </div>
                    )}

                    {/* Card Navigation & Management */}
                    <div className="flex items-center justify-between gap-2 bg-muted/10 p-2 rounded-lg border border-[var(--border-dim)]">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
                                disabled={activeCardIndex === 0}
                                className="p-1 hover:bg-background rounded-md disabled:opacity-30 transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setActiveCardIndex(prev => Math.min((data.cards?.length || 1) - 1, prev + 1))}
                                disabled={activeCardIndex === (data.cards?.length || 1) - 1}
                                className="p-1 hover:bg-background rounded-md disabled:opacity-30 transition-colors text-muted-foreground hover:text-foreground"
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
                                        "h-1.5 rounded-full transition-all",
                                        activeCardIndex === i ? "bg-[var(--ey-yellow)] w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-1.5"
                                    )}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-1">
                            {(data.cards || []).length > 2 && (
                                <button
                                    onClick={() => removeCard(activeCardIndex)}
                                    className="p-1 text-destructive/80 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                            {(data.cards || []).length < 10 && (
                                <button
                                    onClick={addCard}
                                    className="p-1 text-[var(--ey-yellow)] hover:bg-[var(--ey-yellow)]/10 rounded-md transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Card Editor */}
                    {activeCard && (
                        <div className="space-y-4 animate-in fade-in flex flex-col pt-2 border-t border-[var(--border-dim)]">
                            <div className="text-[10px] font-bold text-foreground mb-1 uppercase tracking-wider">Card {activeCardIndex + 1}</div>
                            {/* Header Type & URL */}
                                <div className="flex items-center justify-between">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Card Media URL or Variable</label>
                                    <div className="flex bg-muted/30 rounded-md p-0.5 border border-[var(--border-dim)]">
                                        <button
                                            onClick={() => updateCard(activeCardIndex, { headerType: 'image' })}
                                            className={cn(
                                                "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-all",
                                                activeCard.headerType === 'image' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <ImageIcon size={10} /> Image
                                        </button>
                                        <button
                                            onClick={() => updateCard(activeCardIndex, { headerType: 'video' })}
                                            className={cn(
                                                "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-medium transition-all",
                                                activeCard.headerType === 'video' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <Video size={10} /> Video
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all font-mono"
                                    value={activeCard.url || ""}
                                    placeholder="https://... or {{var}}"
                                    onChange={(e) => updateCard(activeCardIndex, { url: e.target.value })}
                                />
                                {activeCard.url?.includes("{{") && (
                                    <p className="text-[8px] text-primary italic">Supports dynamic variables</p>
                                )}

                            {/* Card Body */}
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Type size={10} className="text-muted-foreground" />
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Body text (max 160)</label>
                                </div>
                                <AutosizeTextarea
                                    className="w-full bg-background rounded-md border border-[var(--border-dim)] p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    value={activeCard.bodyText || ""}
                                    placeholder="Describe this option..."
                                    maxLength={160}
                                    onChange={(e) => updateCard(activeCardIndex, { bodyText: e.target.value })}
                                />
                            </div>

                            {/* Button Configuration */}
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center justify-between border-t border-[var(--border-dim)] pt-4">
                                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Card Action</label>
                                    <select
                                        className="bg-background rounded-md px-2 py-1.5 text-[10px] border border-[var(--border-dim)] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
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
                                        <option value="cta_url">Link / Call-to-Action</option>
                                        <option value="quick_reply">Quick Reply Buttons</option>
                                    </select>
                                </div>

                                {activeCard.buttonType === 'cta_url' ? (
                                    <div className="flex flex-col gap-2 mt-2">
                                        <input
                                            type="text"
                                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                            value={activeCard.ctaUrlButton?.displayText || ""}
                                            placeholder="Button Text"
                                            onChange={(e) => updateCard(activeCardIndex, {
                                                ctaUrlButton: { ...activeCard.ctaUrlButton, displayText: e.target.value }
                                            })}
                                        />
                                        <input
                                            type="text"
                                            className="w-full bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all font-mono"
                                            value={activeCard.ctaUrlButton?.url || ""}
                                            placeholder="URL or {{var}}"
                                            onChange={(e) => updateCard(activeCardIndex, {
                                                ctaUrlButton: { ...activeCard.ctaUrlButton, url: e.target.value }
                                            })}
                                        />
                                        {activeCard.ctaUrlButton?.url?.includes("{{") && (
                                            <p className="text-[8px] text-primary italic">Supports dynamic variables</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2 mt-2">
                                        {(activeCard.quickReplyButtons || []).map((btn: any, btnIdx: number) => (
                                            <div key={btn.id} className="relative">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-muted/30 rounded-md border border-[var(--border-dim)] py-1.5 px-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all text-center"
                                                        value={btn.title || ""}
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
                                                        className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
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
                                                className="w-full py-1.5 border border-dashed border-[var(--border-dim)] rounded-md text-[10px] text-ey-yellow-text font-bold hover:bg-muted/10 transition-all text-center"
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
                    <div className="pt-4 border-t border-[var(--border-dim)] space-y-3">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare size={10} className="text-muted-foreground" />
                                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight">Capture selection to variable</label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    className="bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
                                    placeholder="variable_name"
                                    value={data.interaction?.input?.variableName || ""}
                                    onChange={(e) => {
                                        const interaction = data.interaction || { mode: 'input', input: { type: 'choice' as const, timeoutSeconds: 3600 } };
                                        updateData({
                                            interaction: {
                                                ...interaction,
                                                input: { ...interaction.input, type: 'choice' as const, variableName: e.target.value }
                                            }
                                        });
                                    }}
                                />
                                <select
                                    className="bg-background rounded-md border border-[var(--border-dim)] px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] transition-all"
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
                    </div>
                </div>
            }
        />
    );
}
