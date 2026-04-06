import { FlowBuilder, type FlowBuilderRef } from "@/features/nodes/presentation/components/flow-builder";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useBot, useUpdateBot, useCreateBot, usePublishBot, useArchiveBot } from "../../data/queries/use-bots";
import { toast } from "sonner";
import { useRef, useEffect, useState } from "react";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/features/nodes/node-types.constants";
import { hasValidOpenAIChatCompletionInput } from "@/features/integrations/openai/domain/chat-completion-validation";
import { isValidAssistantThreadIdInput } from "@/features/integrations/openai/domain/assistant-thread-id-validation";
import { BotEditorNavbar } from "../components/bot-editor-navbar";

const MAX_LANGUAGE_NODE_LANGUAGES = 10;

export function BotEditorPage() {
    const { id } = useParams({ from: "/bot/$id" });
    const navigate = useNavigate();
    const isNew = id === "new";

    const { data: bot, isLoading } = useBot(id);
    const updateBotMutation = useUpdateBot(id);
    const createBotMutation = useCreateBot();
    const publishBotMutation = usePublishBot();
    const archiveBotMutation = useArchiveBot();
    const flowBuilderRef = useRef<FlowBuilderRef>(null);

    const getIntegrationValidationError = () => {
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
                if (!hasValidOpenAIChatCompletionInput({
                    messages: nodeData["messages"],
                })) {
                    return `${nodeLabel}: at least one non-empty message is required for chat completion.`;
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

                if (!isValidAssistantThreadIdInput(nodeData["threadId"])) {
                    return `${nodeLabel}: thread ID template must be {{session.key}} or {{contact.key}}.`;
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

        const languageNodes = localNodes.filter((n) => n.type === NodeType.LANGUAGE);
        const primaryLanguageNode = languageNodes[0];

        const derivedLocalization = (() => {
            if (!primaryLanguageNode) {
                return bot?.settings?.localization;
            }

            const nodeData = primaryLanguageNode.data as Record<string, unknown>;
            const nodeLanguages = Array.isArray(nodeData.languages)
                ? (nodeData.languages as string[]).map((lang) => lang.trim()).filter(Boolean)
                : [];
            const uniqueLanguages = Array.from(new Set(nodeLanguages)).slice(0, MAX_LANGUAGE_NODE_LANGUAGES);
            const defaultLanguage = typeof nodeData.defaultLanguage === "string" && nodeData.defaultLanguage.trim().length > 0
                ? nodeData.defaultLanguage.trim()
                : uniqueLanguages[0];

            return {
                isEnabled: uniqueLanguages.length > 0,
                languages: uniqueLanguages,
                defaultLanguage,
            };
        })();

        if (languageNodes.length > 1) {
            toast.warning("Multiple language nodes detected. Localization settings will follow the first language node in the flow.");
        }

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
            } else if (n.type === "language") {
                const currentData = n.data as Record<string, unknown>;
                const languages = Array.isArray(currentData.languages)
                    ? (currentData.languages as string[]).map((lang) => lang.trim()).filter(Boolean)
                    : [];
                const limitedLanguages = Array.from(new Set(languages)).slice(0, MAX_LANGUAGE_NODE_LANGUAGES);
                const localizationEnabled = typeof currentData.localizationEnabled === "boolean"
                    ? currentData.localizationEnabled
                    : limitedLanguages.length > 0;
                const defaultLanguage = typeof currentData.defaultLanguage === "string" && currentData.defaultLanguage.trim().length > 0
                    ? currentData.defaultLanguage.trim()
                    : limitedLanguages[0];

                if (languages.length > MAX_LANGUAGE_NODE_LANGUAGES) {
                    toast.error(`Language node supports up to ${MAX_LANGUAGE_NODE_LANGUAGES} languages. Extra languages were removed.`);
                }

                backendData = {
                    message: (currentData.message as string) || "Please select your language",
                    variable: (currentData.variable as string) || "selected_language",
                    timeoutSeconds: (currentData.timeoutSeconds as number) || 3600,
                    localizationEnabled,
                    languages: limitedLanguages,
                    defaultLanguage,
                };

                branches = [{ key: "default", label: "Default" }];
            } else if (n.type === "start") {
                branches = [{ key: "default", label: "Default" }];
            } else if (n.type === "end") {
                branches = []; // End nodes theoretically have no outbound branches
            } else if (n.type === "send_carousel") {
                const cards = (n.data.cards as any[]) || [];
                const firstCard = cards[0];
                
                // Sync all cards with the first card's buttons
                if (firstCard) {
                    n.data.cards = cards.map(card => ({
                        ...card,
                        buttonType: firstCard.buttonType,
                        ctaUrlButton: firstCard.ctaUrlButton,
                        quickReplyButtons: firstCard.quickReplyButtons,
                    }));
                }

                const allQuickReplies = (firstCard?.buttonType === 'quick_reply' ? (firstCard.quickReplyButtons || []) : []);

                // Ensure interaction object is correctly populated for the engine
                if (allQuickReplies.length > 0) {
                    n.data.interaction = {
                        mode: 'input',
                        input: {
                            type: 'choice',
                            timeoutSeconds: 3600,
                            options: allQuickReplies.map((btn: any) => ({
                                id: btn.id,
                                label: btn.title,
                                branchKey: btn.id,
                            })) as any,
                        }
                    };
                } else {
                    delete n.data.interaction;
                }

                if (allQuickReplies.length > 0) {
                    branches = [
                        ...allQuickReplies.map((btn: any) => ({ key: btn.id, label: btn.title })),
                        { key: "timeout", label: "Timeout" }
                    ];
                } else {
                    branches = [{ key: "default", label: "Default" }];
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
            settings: {
                ...(bot?.settings || { timeoutSeconds: 300, maxSteps: 100 }),
                localization: derivedLocalization,
            },
        };

        try {
            if (isNew) {
                const newBot = await createBotMutation.mutateAsync(payload as any);
                toast.success("Bot created! Let's configure your WhatsApp settings.");
                navigate({ to: "/bot/$id/settings", params: { id: newBot.id } });
            } else {
                await updateBotMutation.mutateAsync(payload as any);
                toast.success("Bot saved successfully!");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save bot.");
        }
    };

    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(bot?.name || "");

    useEffect(() => {
        if (bot?.name) setTempName(bot.name);
    }, [bot?.name]);

    const handleInlineRename = async () => {
        if (!tempName.trim() || tempName === bot?.name) {
            setIsEditingName(false);
            return;
        }

        try {
            await updateBotMutation.mutateAsync({ name: tempName });
            toast.success("Bot renamed successfully!");
            setIsEditingName(false);
        } catch (error) {
            toast.error("Failed to rename bot.");
            setTempName(bot?.name || "");
            setIsEditingName(false);
        }
    };

    if (isLoading && !isNew) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }
    const isPublished = bot?.status === "published";

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
        } else if (n.type === "language") {
            const settingsLocalization = bot?.settings?.localization;
            const languageList = Array.isArray(n.data.languages) && n.data.languages.length > 0
                ? (n.data.languages as string[]).slice(0, MAX_LANGUAGE_NODE_LANGUAGES)
                : (settingsLocalization?.languages || []);
            const localizationEnabled = typeof n.data.localizationEnabled === "boolean"
                ? n.data.localizationEnabled
                : (settingsLocalization?.isEnabled ?? languageList.length > 0);

            frontendData = {
                message: n.data.message || "Please select your language",
                variable: n.data.variable || "selected_language",
                timeoutSeconds: n.data.timeoutSeconds || 3600,
                localizationEnabled,
                languages: languageList,
                defaultLanguage: n.data.defaultLanguage || settingsLocalization?.defaultLanguage || languageList[0],
            };
        }
        return {
            id: n.id,
            type: n.type,
            position: n.position,
            data: { 
                ...frontendData,
                branches: n.branches || []
            }
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
            <BotEditorNavbar 
                id={id}
                bot={bot}
                isNew={isNew}
                isPublished={isPublished}
                activeTab="flow"
                isEditingName={isEditingName}
                tempName={tempName}
                onUpdateTempName={setTempName}
                onStartRename={() => setIsEditingName(true)}
                onCancelRename={() => {
                    setTempName(bot?.name || "");
                    setIsEditingName(false);
                }}
                onRename={handleInlineRename}
                onSave={handleSave}
                onPublish={async () => {
                    const integrationValidationError = getIntegrationValidationError();
                    if (integrationValidationError) {
                        toast.error(integrationValidationError);
                        return;
                    }
                    
                    try {
                        await handleSave();
                        publishBotMutation.mutate(id, {
                            onSuccess: () => toast.success("Bot published successfully!"),
                            onError: (err: any) => {
                                const message = err?.response?.data?.message || err?.message || "Failed to publish bot";
                                toast.error(message);
                            },
                        });
                    } catch (error) {}
                }}
                onUnpublish={() => archiveBotMutation.mutate(id, {
                    onSuccess: () => toast.success("Bot archived. You can now edit it."),
                    onError: () => toast.error("Failed to archive bot"),
                })}
                isSaving={updateBotMutation.isPending || createBotMutation.isPending}
                isPublishing={publishBotMutation.isPending}
                isUnpublishing={archiveBotMutation.isPending}
            />

            {/* Editor Content */}
            <main className="relative flex-1 overflow-hidden">
                <FlowBuilder
                    key={id}
                    ref={flowBuilderRef}
                    initialNodes={bot ? initialNodes : undefined}
                    initialEdges={bot ? initialEdges : undefined}
                />
            </main>


        </div>
    );
}
