import { FlowBuilder, type FlowBuilderRef } from "@/features/nodes/presentation/components/flow-builder";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Save, Play, Settings, Loader2, Rocket, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBot, useUpdateBot, useCreateBot, usePublishBot, useArchiveBot } from "../../data/queries/use-bots";
import { toast } from "sonner";
import { useRef, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/features/nodes/node-types.constants";
import { useState } from "react";
import { BotSettingsDialog } from "@/features/settings/presentation/components/bot-settings-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BotEditorPage() {
    const { id } = useParams({ from: "/bot/$id" });
    const isNew = id === "new";

    const { data: bot, isLoading } = useBot(id);
    const updateBotMutation = useUpdateBot(id);
    const createBotMutation = useCreateBot();
    const publishBotMutation = usePublishBot();
    const archiveBotMutation = useArchiveBot();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const flowBuilderRef = useRef<FlowBuilderRef>(null);

    useEffect(() => {
        const handleOpenSettings = () => setSettingsOpen(true);
        window.addEventListener('open-bot-settings', handleOpenSettings);
        return () => window.removeEventListener('open-bot-settings', handleOpenSettings);
    }, []);

    const hasInvalidIntegrationNodes = () => {
        const flowState = flowBuilderRef.current?.getFlowState();
        const sourceNodes = flowState?.nodes ?? initialNodes;
        for (const node of sourceNodes) {
            if (
                node.type !== NodeType.OPENAI &&
                node.type !== NodeType.ELEVENLABS &&
                node.type !== NodeType.GOOGLE_SHEETS &&
                node.type !== NodeType.HTTP_REQUEST
            ) {
                continue;
            }

            const nodeData = node.data as Record<string, unknown>;
            const nodeLabel = `${node.type} (${node.id})`;

            if (node.type === NodeType.HTTP_REQUEST) {
                const url = typeof nodeData["url"] === "string" ? nodeData["url"].trim() : "";
                const method = typeof nodeData["method"] === "string" ? nodeData["method"].trim() : "";

                if (!url) {
                    return `${nodeLabel}: URL is required.`;
                }

                try {
                    // Mirror backend zod URL validation to avoid generic save failures.
                    new URL(url);
                } catch {
                    return `${nodeLabel}: URL must be a valid absolute URL.`;
                }

                if (!method) {
                    return `${nodeLabel}: HTTP method is required.`;
                }

                continue;
            }

            if (node.type === NodeType.ELEVENLABS) {
                if (!nodeData["credentialId"] || !nodeData["voiceId"] || !nodeData["text"] || !nodeData["resultVariable"]) {
                    return `${nodeLabel}: credential, voice, text, and result variable are required.`;
                }
                continue;
            }

            if (node.type === NodeType.GOOGLE_SHEETS) {
                const action = (nodeData["action"] as string | undefined) ?? "insert_row";
                const hasValues = typeof nodeData["values"] === "object" && nodeData["values"] !== null && Object.keys(nodeData["values"] as Record<string, unknown>).length > 0;

                if (!nodeData["credentialId"] || !nodeData["spreadsheetId"] || !nodeData["sheetId"]) {
                    return `${nodeLabel}: credential, spreadsheet, and worksheet are required.`;
                }

                if (action === "insert_row") {
                    if (!hasValues) {
                        return `${nodeLabel}: at least one column value is required for insert row.`;
                    }
                    continue;
                }

                if (action === "update_row") {
                    const rowId = nodeData["rowId"];
                    const validRowId = typeof rowId === "number" && Number.isInteger(rowId) && rowId > 0;
                    if (!validRowId || !hasValues) {
                        return `${nodeLabel}: row ID and at least one value are required for update row.`;
                    }
                }

                continue;
            }

            const mode = (nodeData["mode"] as string | undefined) ?? "chat_completion";
            const voiceAction = (nodeData["voiceAction"] as string | undefined) ?? "create_speech";

            if (!nodeData["credentialId"]) {
                return `${nodeLabel}: OpenAI credential is required.`;
            }

            if (mode !== "assistant" && !nodeData["model"]) {
                return `${nodeLabel}: model is required for mode ${mode}.`;
            }

            if (mode === "chat_completion") {
                if (!nodeData["prompt"]) {
                    return `${nodeLabel}: message template is required for chat completion.`;
                }
                continue;
            }

            if (mode === "voice" && voiceAction === "create_speech") {
                if (!nodeData["prompt"] || !nodeData["voice"]) {
                    return `${nodeLabel}: text and voice are required for speech generation.`;
                }
                continue;
            }

            if (mode === "voice" && voiceAction === "create_transcription") {
                if (!nodeData["audioUrl"] && !nodeData["prompt"]) {
                    return `${nodeLabel}: audio URL or transcription prompt is required.`;
                }
                continue;
            }

            if (mode === "assistant") {
                if (!nodeData["assistantId"] || !nodeData["prompt"]) {
                    return `${nodeLabel}: assistant ID and message are required for assistant mode.`;
                }
                continue;
            }

            if (mode === "generate_variables") {
                const variables = Array.isArray(nodeData["variablesToExtract"])
                    ? (nodeData["variablesToExtract"] as unknown[])
                    : [];
                if (!nodeData["prompt"] || variables.length === 0) {
                    return `${nodeLabel}: prompt and at least one variable are required for generate variables mode.`;
                }
                continue;
            }

            if (mode === "image") {
                if (!nodeData["prompt"]) {
                    return `${nodeLabel}: prompt is required for image generation.`;
                }
            }

            continue;
        }

        return null;
    };

    const handleSave = async () => {
        if (!flowBuilderRef.current) return;
        const integrationValidationError = getIntegrationValidationError();
        if (integrationValidationError) {
            toast.error(integrationValidationError);
            return;
        }

        const { nodes: localNodes, edges: localEdges } = flowBuilderRef.current.getFlowState();

        const mapNodeToBackend = (n: Node & { branches?: { key: string; label: string }[] }) => {
            let backendData = { ...n.data };
            const resolvedBranches = (n.branches ?? backendData.branches ?? []) as { key: string; label: string }[];
            let branches: { key: string; label: string }[] = [...resolvedBranches];

            if (backendData.branches) {
                delete (backendData as any).branches;
            }

            if (n.type === "ask_question") {
                backendData = {
                    message: n.data.question || "Default question",
                    variableName: n.data.variable || "var",
                    variableScope: "session",
                    inputType: n.data.validationType || "text",
                    timeoutSeconds: n.data.timeoutSeconds || 3600
                };
                branches = [
                    { key: "default", label: "Success" },
                    { key: "error", label: "Error / Timeout" }
                ];
            } else if (n.type === "nps") {
                backendData = {
                    message: n.data.message || "How likely are you to recommend us?",
                    variableName: n.data.variable || "nps_score",
                    variableScope: n.data.variableScope || "session",
                    length: n.data.length ?? 10,
                    startsAt: n.data.startsAt ?? 1,
                    leftLabel: n.data.leftLabel,
                    rightLabel: n.data.rightLabel,
                    buttonLabel: n.data.buttonLabel || "Rate",
                    timeoutSeconds: n.data.timeoutSeconds || 3600
                };
                branches = [{ key: "default", label: "Default" }];
            } else if (n.type === "send_buttons") {
                backendData = {
                    ...backendData,
                    timeoutSeconds: 3600
                };
                const buttons = (n.data.buttons as any[]) || [];
                if (!branches.length) {
                    branches = buttons.map(b => ({ key: b.id, label: b.title }));
                    branches.push({ key: "timeout", label: "Timeout" });
                }
            } else if (n.type === "send_list") {
                const sections = (n.data.sections as Array<{ rows?: Array<{ id: string; title: string }> }>) || [];
                if (!branches.length) {
                    branches = sections.flatMap(section =>
                        (section.rows || []).map(row => ({ key: row.id, label: row.title || row.id }))
                    );
                    if (!branches.length) {
                        branches = [{ key: "default", label: "Default" }];
                    }
                }
                if (!branches.some(b => b.key === "default")) {
                    branches.push({ key: "default", label: "Default" });
                }
            } else if (n.type === "start") {
                branches = [{ key: "default", label: "Default" }];
            } else if (n.type === "end") {
                branches = []; // End nodes theoretically have no outbound branches
            } else if (n.type === "send_carousel") {
                const cards = (n.data.cards as any[]) || [];
                const allQuickReplies = cards.flatMap(card =>
                    card.buttonType === 'quick_reply' ? (card.quickReplyButtons || []) : []
                );

                if (!branches.length || branches.some(b => b.key === 'default')) {
                    branches = [
                        ...allQuickReplies.map(btn => ({ key: btn.id, label: btn.title })),
                        { key: "timeout", label: "Timeout" }
                    ];
                }
            } else if (n.type === "send_cards") {
                // SEND_CARDS in interactive mode: each card can have buttons with IDs
                // that become branch keys on the edges. In the renderer, it specifically
                // uses 'branchKey' as the handle ID.
                const items = (n.data.items as any[]) || [];
                const interaction = n.data.interaction as any;
                if (interaction?.mode === 'input') {
                    const buttonBranches = items.flatMap((item: any) =>
                        (item.buttons || []).map((b: any) => ({ key: b.branchKey || b.id, label: b.text || b.id }))
                    );
                    // Deduplicate by key
                    const seen = new Set<string>();
                    branches = [];
                    for (const b of buttonBranches) {
                        if (!seen.has(b.key)) { seen.add(b.key); branches.push(b); }
                    }
                    if (!branches.length) {
                        branches = [{ key: "default", label: "Default" }];
                    }
                    if (!branches.some(b => b.key === "timeout")) {
                        branches.push({ key: "timeout", label: "Timeout" });
                    }
                } else {
                    branches = [{ key: "default", label: "Default" }];
                }
            } else {
                // send_text, send_image, etc. Use existing branches if renderer supplied them
                if (!branches.length) {
                    branches = [{ key: "default", label: "Default" }];
                }
            }

            return {
                id: n.id,
                type: n.type,
                label: n.type,
                position: n.position,
                data: backendData,
                branches: branches
            };
        };

        const mapEdgeToBackend = (e: Edge) => ({
            id: e.id,
            sourceNodeId: e.source,
            sourceBranchKey: e.sourceHandle || "default",
            targetNodeId: e.target,
        });

        const payload = {
            name: bot?.name || "New Bot",
            orgId: "68b08633907a113536238290", // Hardcoded temporary default to satisfy testing constraint
            nodes: localNodes.map(mapNodeToBackend),
            edges: localEdges.map(mapEdgeToBackend),
            triggerType: bot?.triggerType || "inbound",
            triggerConfig: bot?.triggerConfig || { keywords: [] },
            status: bot?.status || "draft",
            settings: bot?.settings || { timeoutSeconds: 300, maxSteps: 100 },
        };

        try {
            if (isNew) {
                await createBotMutation.mutateAsync(payload as any);
                toast.success("Bot created successfully!");
            } else {
                await updateBotMutation.mutateAsync(payload as any);
                toast.success("Bot saved successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save bot.");
        }
    };

    if (isLoading && !isNew) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // Map backend format back to frontend React Flow format
    const initialNodes = bot?.nodes?.map((n: any) => {
        let frontendData = { ...n.data };
        if (n.type === "ask_question") {
            frontendData = {
                question: n.data.message || "",
                variable: n.data.variableName || "var",
                validationType: n.data.inputType || "text",
                timeoutSeconds: n.data.timeoutSeconds || 3600
            };
        } else if (n.type === "nps") {
            frontendData = {
                message: n.data.message || "",
                variable: n.data.variableName || "nps_score",
                variableScope: n.data.variableScope || "session",
                length: n.data.length ?? 10,
                startsAt: n.data.startsAt ?? 1,
                leftLabel: n.data.leftLabel,
                rightLabel: n.data.rightLabel,
                buttonLabel: n.data.buttonLabel || "Rate",
                timeoutSeconds: n.data.timeoutSeconds || 3600
            };
        }
        return {
            id: n.id,
            type: n.type,
            position: n.position,
            data: frontendData
        };
    }) || [];

    const initialEdges = bot?.edges?.map((e: any) => ({
        id: e.id,
        source: e.sourceNodeId,
        sourceHandle: e.sourceBranchKey === "default" ? undefined : e.sourceBranchKey,
        target: e.targetNodeId,
    })) || [];

    return (
        <div className="flex h-screen w-full flex-col bg-background">
            {/* Editor Header */}
            <header className="flex items-center justify-between border-b px-6 py-3 bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link to="/bots">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold tracking-tight">
                            {bot?.name || (isNew ? "New Bot" : "Loading...")}{" "}
                            <span className="text-muted-foreground font-normal">/ {id}</span>
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {bot?.status || "Draft"} • {bot?.updatedAt ? `Saved just now` : "Not saved yet"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isNew && bot?.status !== "published" && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                            onClick={() => {
                                const integrationValidationError = getIntegrationValidationError();
                                if (integrationValidationError) {
                                    toast.error(integrationValidationError);
                                    return;
                                }
                                publishBotMutation.mutate(id, {
                                    onSuccess: () => toast.success("Bot published successfully!"),
                                    onError: () => toast.error("Failed to publish bot"),
                                });
                            }}
                            disabled={publishBotMutation.isPending}
                        >
                            {publishBotMutation.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Rocket className="size-3.5" />
                            )}
                            Publish
                        </Button>
                    )}
                    {!isNew && bot?.status === "published" && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100"
                            onClick={() => archiveBotMutation.mutate(id, {
                                onSuccess: () => toast.success("Bot archived. You can now edit it."),
                                onError: () => toast.error("Failed to archive bot"),
                            })}
                            disabled={archiveBotMutation.isPending}
                        >
                            {archiveBotMutation.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Archive className="size-3.5" />
                            )}
                            Unpublish
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => setSettingsOpen(true)}
                    >
                        <Settings className="size-3.5" />
                        Settings
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-primary border-primary/20 bg-primary/5 hover:bg-primary/10" disabled={isNew} asChild={!isNew}>
                        {isNew ? (
                            <>
                                <Play className="size-3.5 fill-primary" />
                                Test Flow
                            </>
                        ) : (
                            <Link to="/bot/$id/test" params={{ id }}>
                                <Play className="size-3.5 fill-primary" />
                                Test Flow
                            </Link>
                        )}
                    </Button>
                    <Button
                        size="sm"
                        className="gap-2 px-6"
                        onClick={handleSave}
                        disabled={updateBotMutation.isPending || createBotMutation.isPending}
                    >
                        {(updateBotMutation.isPending || createBotMutation.isPending) ? (
                            <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                            <Save className="size-3.5" />
                        )}
                        {isNew ? "Create" : "Save Changes"}
                    </Button>
                </div>
            </header>

            {/* Editor Content */}
            <main className="relative flex-1 overflow-hidden">
                <FlowBuilder
                    key={id}
                    ref={flowBuilderRef}
                    initialNodes={bot ? initialNodes : undefined}
                    initialEdges={bot ? initialEdges : undefined}
                />
            </main>

            {bot && (
                <BotSettingsDialog
                    open={settingsOpen}
                    onOpenChange={setSettingsOpen}
                    bot={bot}
                    onSave={async (updates) => {
                        try {
                            await updateBotMutation.mutateAsync(updates);
                            toast.success("Settings updated successfully!");
                        } catch (error) {
                            toast.error("Failed to update settings.");
                        }
                    }}
                />
            )}
        </div>
    );
}
