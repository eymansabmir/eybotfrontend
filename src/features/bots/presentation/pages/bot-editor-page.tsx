import { FlowBuilder, type FlowBuilderRef } from "@/features/nodes/presentation/components/flow-builder";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertTriangle } from "lucide-react";
import { 
    useBot, 
    useUpdateBot, 
    useCreateBot, 
    usePublishBot, 
    useArchiveBot,
    useFlowTranslation,
    useUpdateFlowTranslation
} from "../../data/queries/use-bots";
import { toast } from "sonner";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/features/nodes/node-types.constants";
import { getNodeDefinition } from "@/features/nodes/registry";
import { FloatingValidationBanner } from "../components/floating-validation-banner";
import { useVariablesStore } from "@/features/variables/store";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DEFAULT_NODES, DEFAULT_EDGES } from "@/features/nodes/defaults";
import { BotEditorNavbar } from "../components/bot-editor-navbar";

const MAX_LANGUAGE_NODE_LANGUAGES = 10;
const VALIDATION_TOAST_ID = "flow-validation";

const NODE_LABELS: Record<string, string> = {
    [NodeType.SEND_TEXT]: "Text",
    [NodeType.SEND_IMAGE]: "Image",
    [NodeType.SEND_VIDEO]: "Video",
    [NodeType.SEND_AUDIO]: "Audio",
    [NodeType.SEND_DOCUMENT]: "Document",
    [NodeType.SEND_LOCATION]: "Location",
    [NodeType.SEND_BUTTONS]: "Buttons",
    [NodeType.SEND_LIST]: "List",
    [NodeType.SEND_TEMPLATE]: "Template",
    [NodeType.SEND_STICKER]: "Sticker",
    [NodeType.SEND_CAROUSEL]: "Carousel",
    [NodeType.LOCATION_REQUEST]: "Location Request",
    [NodeType.ASK_QUESTION]: "Question",
    [NodeType.ASK_FILE]: "File Request",
    [NodeType.NPS]: "Rating",
    [NodeType.SEND_CARDS]: "Cards",
    [NodeType.SEND_REACTION]: "Reaction",
    [NodeType.CONDITION]: "Condition",
    [NodeType.SET_VARIABLE]: "Set Variable",
    [NodeType.RANDOM_SPLIT]: "Random Split",
    [NodeType.START]: "Start",
    [NodeType.END]: "End",
    [NodeType.JUMP_TO_FLOW]: "Jump to Flow",
    [NodeType.HUMAN_HANDOFF]: "Human Handoff",
    [NodeType.WEBHOOK]: "Webhook",
    [NodeType.HTTP_REQUEST]: "HTTP Request",
    [NodeType.GOOGLE_SHEETS]: "Google Sheets",
    [NodeType.NOCODB]: "NocoDB",
    [NodeType.LANGUAGE]: "Language",
    [NodeType.OPENAI]: "OpenAI",
    [NodeType.ELEVENLABS]: "ElevenLabs",
    [NodeType.ANTHROPIC]: "Anthropic",
    [NodeType.DEEPSEEK]: "DeepSeek",
    [NodeType.VARIABLE_MANAGER]: "Variable Manager",
    [NodeType.MEDIA_CONDITIONAL]: "Media Conditional",
};

export function BotEditorPage() {
    const { id } = useParams({ from: "/bot/$id" });
    const navigate = useNavigate();
    const isNew = id === "new";

    const [selectedLang, setSelectedLang] = useState("default");
    const isTranslationMode = selectedLang !== "default";

    const { data: bot, isLoading } = useBot(id);
    const { data: translationData, isLoading: isLoadingTranslation } = useFlowTranslation(id, selectedLang);
    
    const updateBotMutation = useUpdateBot(id);
    const createBotMutation = useCreateBot();
    const publishBotMutation = usePublishBot();
    const archiveBotMutation = useArchiveBot();
    const updateTranslationMutation = useUpdateFlowTranslation(id, selectedLang);
    
    const flowBuilderRef = useRef<FlowBuilderRef>(null);
    const baselineSnapshotRef = useRef<string>("");

    const [isDirty, setIsDirty] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<"bots" | "settings" | null>(null);

    const { variables, setVariables } = useVariablesStore();
    const isPublished = bot?.status === "published";
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(bot?.name || "");

    useEffect(() => {
        if (bot?.name) setTempName(bot.name);
    }, [bot?.name]);

    const [liveLanguages, setLiveLanguages] = useState<string[]>([]);

    const handleNodesChange = useCallback((nodes: Node[]) => {
        const langNode = nodes.find(n => n.type === NodeType.LANGUAGE);
        if (langNode) {
            const langs = (langNode.data as any).languages || [];
            setLiveLanguages(langs);
        } else {
            setLiveLanguages([]);
        }
    }, []);
    useEffect(() => {
        if (bot?.settings?.variables) {
            setVariables(bot.settings.variables as any);
        } else if (isNew) {
            setVariables([]);
        }
    }, [bot, isNew, setVariables]);

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

        if (isTranslationMode) {
            const { nodes: localNodes } = flowBuilderRef.current.getFlowState();
            
            // Map frontend nodes back to backend node format for translation storage
            const mappedNodes = localNodes.map(n => {
                let backendData = { ...n.data };

                // Strip technical/logic fields that must ONLY live on the master flow.
                // Translation records should only contain translatable content (messages, labels).
                // Without this, stale technical values (e.g. skipIfAlreadySelected) baked into
                // old translation saves will overwrite the master flow's current settings at runtime.
                if (n.type === "language") {
                    const {
                        skipIfAlreadySelected,
                        localizationEnabled,
                        languages,
                        defaultLanguage,
                        variableName,
                        variable,
                        variableScope,
                        timeoutSeconds,
                        isTranslationMode,
                        branches,
                        ...contentOnly
                    } = backendData;
                    backendData = contentOnly;
                }

                // Reverse same mapping used in initialNodes for translation save
                if (n.type === "ask_question") {
                    backendData = {
                        ...backendData,
                        message: n.data.question,
                        variableName: n.data.variable || n.data.variableName,
                        inputType: n.data.validationType,
                    };
                } else if (n.type === "nps") {
                    backendData = {
                        ...backendData,
                        message: n.data.message,
                        variableName: n.data.variable || n.data.variableName,
                        variableScope: n.data.variableScope,
                    };
                }
                return {
                    id: n.id,
                    type: n.type,
                    label: n.type, // Standard label
                    data: backendData,
                    position: n.position,
                    branches: (n as any).branches || (n.data as any).branches || []
                };
            });

            try {
                await updateTranslationMutation.mutateAsync(mappedNodes);
                toast.success(`${selectedLang.toUpperCase()} translation saved successfully!`);
                return;
            } catch (err) {
                console.error(err);
                toast.error("Failed to save translation.");
                return;
            }
        }

        const integrationValidationError = getIntegrationValidationError();
        if (integrationValidationError) {
            toast.error(integrationValidationError);
            return;
        }

        const { nodes: localNodes, edges: localEdges } = flowBuilderRef.current.getFlowState();

        const languageNodes = localNodes.filter((n) => n.type === NodeType.LANGUAGE);
        let localizationSettings = bot?.settings?.localization;

        if (languageNodes.length > 0) {
            const firstLangNode = languageNodes[0];
            const data = firstLangNode.data as any;
            localizationSettings = {
                isEnabled: typeof data.localizationEnabled === "boolean" 
                    ? data.localizationEnabled 
                    : (Array.isArray(data.languages) && data.languages.length > 0),
                languages: Array.isArray(data.languages) ? data.languages : [],
                defaultLanguage: data.defaultLanguage || (Array.isArray(data.languages) ? data.languages[0] : undefined),
            };
        }

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
                    variable: (currentData.variableName as string) || (currentData.variable as string) || "selected_language",
                    variableName: (currentData.variableName as string) || (currentData.variable as string) || "selected_language",
                    variableScope: (currentData.variableScope as string) || "session",
                    timeoutSeconds: (currentData.timeoutSeconds as number) || 3600,
                    localizationEnabled,
                    languages: limitedLanguages,
                    defaultLanguage,
                    skipIfAlreadySelected: !!currentData.skipIfAlreadySelected,
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

        const nodesToSave = localNodes.map(mapNodeToBackend);


        const payload = {
            name: bot?.name || "New Bot",
            orgId: "68b08633907a113536238290", 
            nodes: nodesToSave,
            edges: localEdges.map(mapEdgeToBackend),
            triggerType: bot?.triggerType || "inbound",
            triggerConfig: bot?.triggerConfig || { keywords: [] },
            status: bot?.status || "draft",
            settings: { 
                ...(bot?.settings || { timeoutSeconds: 300, maxSteps: 100 }), 
                variables,
                localization: localizationSettings
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

    const handleInlineRename = async (nextName = tempName) => {
        if (!nextName.trim() || nextName === bot?.name) {
            setIsEditingName(false);
            return;
        }

        try {
            await updateBotMutation.mutateAsync({ name: nextName });
            toast.success("Bot renamed successfully!");
            setTempName(nextName);
            setIsEditingName(false);
        } catch (error) {
            toast.error("Failed to rename bot.");
            setTempName(bot?.name || "");
            setIsEditingName(false);
        }
    };

    const isPublished = bot?.status === "published";

    const handlePublish = async () => {
        const integrationValidationError = getIntegrationValidationError();
        if (integrationValidationError) {
            toast.error(integrationValidationError);
            return;
        }

        try {
            await handleSave();
            publishBotMutation.mutate(id, {
                onSuccess: () => toast.success("Bot published successfully!"),
                onError: () => toast.error("Failed to publish bot"),
            });
        } catch {
            // Save already reports errors.
        }
    };

    const handleUnpublish = () => {
        archiveBotMutation.mutate(id, {
            onSuccess: () => toast.success("Bot archived. You can now edit it."),
            onError: () => toast.error("Failed to archive bot"),
        });
    };

>>>>>>> 2961fc1aafbc16924ff3c8a09c0e001b9001347f
    const initialNodes = useMemo(() => {
        const baseNodes = (bot?.nodes as any[]) || [];
        const translatedSource = translationData?.translatedData as any[] | undefined;

        const sourceNodes = isTranslationMode && translatedSource
            ? baseNodes.map((base: any) => {
                const translation = translatedSource.find(t => t.id === base.id);
                if (!translation) return base;
                const tData = translation.data || {};
                return {
                    ...base,
                    data: {
                        ...base.data,
                        ...tData,
                    }
                };
            })
            : (baseNodes.length > 0 ? baseNodes : (isNew ? DEFAULT_NODES : []));

        return sourceNodes.map((n: any) => {
            let frontendData = { ...n.data };
            if (n.type === "ask_question") {
                frontendData = {
                    ...frontendData,
                    question: n.data.message || "",
                    variable: n.data.variableName || "var",
                    validationType: n.data.inputType || "text",
                    timeoutSeconds: n.data.timeoutSeconds || 3600
                };
            } else if (n.type === "nps") {
                frontendData = {
                    ...frontendData,
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
                    ...frontendData,
                    message: n.data.message || "Please select your language",
                    variableName: n.data.variableName || n.data.variable || "selected_language",
                    variable: n.data.variableName || n.data.variable || "selected_language",
                    variableScope: n.data.variableScope || "session",
                    timeoutSeconds: n.data.timeoutSeconds || 3600,
                    localizationEnabled,
                    languages: languageList,
                    defaultLanguage: n.data.defaultLanguage || settingsLocalization?.defaultLanguage || languageList[0],
                    skipIfAlreadySelected: !!n.data.skipIfAlreadySelected,
                };
            }
            return {
                id: n.id,
                type: n.type,
                position: n.position,
                data: { 
                    ...frontendData,
                    isTranslationMode,
                    branches: n.branches || []
                }
            };
        }) || [];
    }, [bot?.nodes, bot?.settings?.localization, translationData, isTranslationMode]);

    const initialEdges = useMemo(() => {
        const baseEdges = bot?.edges || [];
        const sourceEdges = baseEdges.length > 0 ? baseEdges : (isNew ? DEFAULT_EDGES : []);
        
        return (sourceEdges as any[]).map((e: any) => ({
            id: e.id,
            source: e.sourceNodeId || e.source,
            sourceHandle: e.sourceBranchKey === "default" ? undefined : (e.sourceBranchKey || e.sourceHandle),
            target: e.targetNodeId || e.target,
        }));
    }, [bot?.edges, isNew]);

    const getFlowValidationErrors = () => {
        const flowState = flowBuilderRef.current?.getFlowState();
        const sourceNodes = flowState?.nodes ?? initialNodes;
        const errors: string[] = [];

        for (const node of sourceNodes) {
            const definition = getNodeDefinition(node.type);
            const nodeData = node.data as Record<string, unknown>;
            const nodeTitle = typeof nodeData["label"] === "string" && nodeData["label"].trim().length > 0
                ? nodeData["label"].trim()
                : NODE_LABELS[node.type] ?? "Node";

            // Call decentralized validator if it exists
            if (definition?.validate) {
                const nodeErrors = definition.validate(nodeData);
                if (nodeErrors) {
                    nodeErrors.forEach(err => errors.push(`${nodeTitle} node: ${err}`));
                }
            }

            // Special global checks (e.g. OpenAI model requirements)
            if (node.type === NodeType.OPENAI) {
                const mode = (nodeData["mode"] as string | undefined) ?? "chat_completion";
                if (!nodeData["credentialId"]) {
                    errors.push(`${nodeTitle} node: select an OpenAI credential.`);
                }
                if (mode !== "assistant" && !nodeData["model"]) {
                    errors.push(`${nodeTitle} node: choose a model for ${mode.replace("_", " ")} mode.`);
                }
            }
        }

        return errors;
    };

    const showValidationErrors = (errors: string[]) => {
        if (errors.length === 0) return;
        toast.error("Fix these issues before saving.", {
            id: VALIDATION_TOAST_ID,
            description: (
                <ul className="list-disc space-y-1 pl-4">
                    {errors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            ),
        });
    };

    const serializeFlowSnapshot = (nodes: Node[], edges: Edge[]) => {
        const nodeSnapshots = nodes
            .map((node) => ({
                id: node.id,
                type: node.type,
                // We ignore position here so that moving nodes doesn't trigger the "Unsaved Changes" banner.
                data: JSON.parse(JSON.stringify(node.data)),
            }))
            .sort((a, b) => a.id.localeCompare(b.id));

        const edgeSnapshots = edges
            .map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle || "default",
                targetHandle: edge.targetHandle || "default",
            }))
            .sort((a, b) => a.id.localeCompare(b.id));

        return JSON.stringify({ nodes: nodeSnapshots, edges: edgeSnapshots });
    };

    const resetDirtyState = (nodes: Node[], edges: Edge[]) => {
        baselineSnapshotRef.current = serializeFlowSnapshot(nodes, edges);
        setIsDirty(false);
    };

    const handleFlowChange = useCallback((payload: { nodes: Node[]; edges: Edge[] }) => {
        const snapshot = serializeFlowSnapshot(payload.nodes, payload.edges);
        
        // If we don't have a baseline yet, this IS the baseline.
        if (!baselineSnapshotRef.current) {
            baselineSnapshotRef.current = snapshot;
            setIsDirty(false);
            return;
        }

        const newDirtyStatus = snapshot !== baselineSnapshotRef.current;
        
        // Only update state if it actually changed to avoid unnecessary re-renders
        setIsDirty((prev) => {
            if (prev === newDirtyStatus) return prev;
            return newDirtyStatus;
        });
    }, []);

    const handleGuardedNavigate = (target: "bots" | "settings") => {
        if (!isDirty) {
            if (target === "bots") {
                navigate({ to: "/bots" });
            } else {
                navigate({ to: "/bot/$id/settings", params: { id } });
            }
            return;
        }

        setPendingNavigation(target);
        setLeaveDialogOpen(true);
    };

    const handleLeaveDialogClose = (open: boolean) => {
        setLeaveDialogOpen(open);
        if (!open) {
            setPendingNavigation(null);
        }
    };

    const handleLeaveAnyway = () => {
        if (!pendingNavigation) return;
        if (pendingNavigation === "bots") {
            navigate({ to: "/bots" });
        } else {
            navigate({ to: "/bot/$id/settings", params: { id } });
        }
        setLeaveDialogOpen(false);
        setPendingNavigation(null);
    };

    const mapNodeToBackend = (n: Node & { branches?: { key: string; label: string }[] }) => {
        let backendData = { ...n.data };
        const resolvedBranches = (n.branches ?? backendData.branches ?? []) as { key: string; label: string }[];
        let branches: { key: string; label: string }[] = [...resolvedBranches];

        if (backendData.branches && n.type !== NodeType.RANDOM_SPLIT) {
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

            backendData = {
                message: (currentData.message as string) || "Please select your language",
                variable: (currentData.variableName as string) || (currentData.variable as string) || "selected_language",
                variableName: (currentData.variableName as string) || (currentData.variable as string) || "selected_language",
                variableScope: (currentData.variableScope as string) || "session",
                timeoutSeconds: (currentData.timeoutSeconds as number) || 3600,
                localizationEnabled,
                languages: limitedLanguages,
                defaultLanguage,
                skipIfAlreadySelected: !!currentData.skipIfAlreadySelected,
            };

            branches = [{ key: "default", label: "Default" }];
        } else if (n.type === "start") {
            branches = [{ key: "default", label: "Default" }];
        } else if (n.type === "end") {
            branches = []; 
        } else if (n.type === "send_carousel") {
            const cards = (n.data.cards as any[]) || [];
            const firstCard = cards[0];
            if (firstCard) {
                n.data.cards = cards.map(card => ({
                    ...card,
                    buttonType: firstCard.buttonType,
                    ctaUrlButton: firstCard.ctaUrlButton,
                    quickReplyButtons: firstCard.quickReplyButtons,
                }));
            }
            const allQuickReplies = (firstCard?.buttonType === 'quick_reply' ? (firstCard.quickReplyButtons || []) : []);
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
                branches = [
                    ...allQuickReplies.map((btn: any) => ({ key: btn.id, label: btn.title })),
                    { key: "timeout", label: "Timeout" }
                ];
            } else {
                delete n.data.interaction;
                branches = [{ key: "default", label: "Default" }];
            }
        } else if (n.type === "send_cards") {
            const items = (n.data.items as any[]) || [];
            const interaction = n.data.interaction as any;
            if (interaction?.mode === 'input') {
                const buttonBranches = items.flatMap((item: any) =>
                    (item.buttons || []).map((b: any) => ({ key: b.branchKey || b.id, label: b.text || b.id }))
                );
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

    const handleSave = async (): Promise<boolean> => {
        if (!flowBuilderRef.current) return false;

        if (isTranslationMode) {
            const { nodes: localNodes, edges: localEdges } = flowBuilderRef.current.getFlowState();
            const mappedNodes = localNodes.map(n => {
                let backendData = { ...n.data };
                if (n.type === "language") {
                    const {
                        skipIfAlreadySelected, localizationEnabled, languages, defaultLanguage,
                        variableName, variable, variableScope, timeoutSeconds,
                        isTranslationMode, branches, ...contentOnly
                    } = backendData;
                    backendData = contentOnly;
                }
                if (n.type === "ask_question") {
                    backendData = { ...backendData, message: n.data.question, variableName: n.data.variable || n.data.variableName, inputType: n.data.validationType };
                } else if (n.type === "nps") {
                    backendData = { ...backendData, message: n.data.message, variableName: n.data.variable || n.data.variableName, variableScope: n.data.variableScope };
                }
                return {
                    id: n.id,
                    type: n.type,
                    label: n.type,
                    data: backendData,
                    position: n.position,
                    branches: (n as any).branches || (n.data as any).branches || []
                };
            });

            try {
                await updateTranslationMutation.mutateAsync(mappedNodes);
                toast.success(`${selectedLang.toUpperCase()} translation saved successfully!`);
                resetDirtyState(localNodes, localEdges);
                return true;
            } catch (err) {
                console.error(err);
                toast.error("Failed to save translation.");
                return false;
            }
        }

        const { nodes: localNodes, edges: localEdges } = flowBuilderRef.current.getFlowState();

        const validationErrors = getFlowValidationErrors();
        if (validationErrors.length > 0) {
            showValidationErrors(validationErrors);
            return false;
        }

        const payload = {
            name: bot?.name || "New Bot",
            orgId: "68b08633907a113536238290", 
            nodes: localNodes.map(mapNodeToBackend),
            edges: localEdges.map(mapEdgeToBackend),
            triggerType: bot?.triggerType || "inbound",
            triggerConfig: bot?.triggerConfig || { keywords: [] },
            status: bot?.status || "draft",
            settings: { ...(bot?.settings || { timeoutSeconds: 300, maxSteps: 100 }), variables },
        };

        try {
            if (isNew) {
                const newBot = await createBotMutation.mutateAsync(payload as any);
                toast.success("Bot created! Let's configure your WhatsApp settings.");
                navigate({ to: "/bot/$id/settings", params: { id: newBot.id } });
                return true;
            } else {
                await updateBotMutation.mutateAsync(payload as any);
                toast.success("Bot saved successfully!");
                resetDirtyState(localNodes, localEdges);
                return true;
            }
        } catch (error: any) {
            console.error(error);
            const responseData = error?.response?.data;
            // Extract specific Zod validation detail if available
            const zodDetail = Array.isArray(responseData?.details) && responseData.details.length > 0
                ? `Validation: ${responseData.details[0]?.message || responseData.details[0]}`
                : null;
            const apiMessage = zodDetail
                || responseData?.message
                || responseData?.error
                || error?.message
                || "Failed to save bot.";
            toast.error(apiMessage, { duration: 8000 });
            return false;
        }
    };

    const handleExport = () => {
        if (!bot) return;
        const { nodes: localNodes, edges: localEdges } = flowBuilderRef.current?.getFlowState() ?? { nodes: [], edges: [] };
        const exportData = {
            name: bot.name,
            description: bot.description,
            triggerType: bot.triggerType,
            triggerConfig: bot.triggerConfig,
            nodes: localNodes.map(mapNodeToBackend),
            edges: localEdges.map(mapEdgeToBackend),
            settings: { ...bot.settings, variables },
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${bot.name.toLowerCase().replace(/\s+/g, "-")}-flow.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Flow exported successfully!");
    };

    const handleInlineRename = async (nextName = tempName) => {
        if (!nextName.trim() || nextName === bot?.name) {
            setIsEditingName(false);
            return;
        }
        try {
            await updateBotMutation.mutateAsync({ name: nextName });
            toast.success("Bot renamed successfully!");
            setTempName(nextName);
            setIsEditingName(false);
        } catch (error) {
            toast.error("Failed to rename bot.");
            setTempName(bot?.name || "");
            setIsEditingName(false);
        }
    };

    const handlePublish = async () => {
        try {
            const saved = await handleSave();
            if (!saved) return;
            publishBotMutation.mutate(id, {
                onSuccess: () => toast.success("Bot published successfully!"),
                onError: () => toast.error("Failed to publish bot"),
            });
        } catch {}
    };

    const handleUnpublish = () => {
        archiveBotMutation.mutate(id, {
            onSuccess: () => toast.success("Bot archived. You can now edit it."),
            onError: () => toast.error("Failed to archive bot"),
        });
    };

    useEffect(() => {
        if (isLoading) return;
        resetDirtyState(initialNodes, initialEdges);
    }, [initialNodes, initialEdges, isLoading]);

    useEffect(() => {
        if (!isDirty) return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    if (isLoading && !isNew) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background">
            <AlertDialog open={leaveDialogOpen} onOpenChange={handleLeaveDialogClose}>
                <AlertDialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-amber-50 dark:bg-amber-950/20 px-6 py-5 flex items-center gap-3 border-b border-amber-100 dark:border-amber-900/30">
                        <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="size-6" />
                        </div>
                        <AlertDialogTitle className="text-lg font-bold text-amber-900 dark:text-amber-200">Unsaved Changes</AlertDialogTitle>
                    </div>
                    
                    <div className="p-6">
                        <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground/90 font-medium">
                            {isPublished
                                ? "This bot is currently published. Flow modifications cannot be saved until you unpublish. Leaving now will permanently discard your current edits."
                                : "You have unsaved modifications in your bot flow. To ensure your work is preserved, please save your changes before leaving the editor."}
                        </AlertDialogDescription>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
                        <AlertDialogCancel className="mt-0 h-10 rounded-full border-border/50 px-6 text-xs font-semibold hover:bg-muted transition-colors">
                            Stay on Page
                        </AlertDialogCancel>
                        
                        <AlertDialogAction
                            className="h-10 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/10 transition-all text-xs font-bold"
                            onClick={handleLeaveAnyway}
                        >
                            Discard & Leave
                        </AlertDialogAction>

                    </div>
                </AlertDialogContent>
            </AlertDialog>
            <BotEditorNavbar
                id={id}
                bot={bot as any}
                isNew={isNew}
                isPublished={isPublished}
                activeTab="flow"
                isEditingName={isEditingName}
                tempName={tempName}
                selectedLang={selectedLang}
                onLangChange={setSelectedLang}
                onRename={(newName) => {
                    setTempName(newName);
                    void handleInlineRename(newName);
                }}
                onStartRename={() => setIsEditingName(true)}
                onCancelRename={() => {
                    setTempName(bot?.name || "");
                    setIsEditingName(false);
                }}
                onUpdateTempName={setTempName}
                onSave={handleSave}
                onExport={handleExport}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                isSaving={updateBotMutation.isPending || createBotMutation.isPending}
                isPublishing={publishBotMutation.isPending}
                isUnpublishing={archiveBotMutation.isPending}
                isTranslationMode={isTranslationMode}
                onNavigateToBots={() => handleGuardedNavigate("bots")}
                onNavigateToSettings={() => handleGuardedNavigate("settings")}
                liveLanguages={liveLanguages}
            />

            <main className="relative flex-1 overflow-hidden">
                {(isLoadingTranslation && isTranslationMode) ? (
                    <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm z-50">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <FlowBuilder
                        key={`${id}-${selectedLang}`}
                        ref={flowBuilderRef}
                        initialNodes={initialNodes}
                        initialEdges={initialEdges}
                        isTranslationMode={isTranslationMode}
                        onFlowChange={handleFlowChange}
                        onNodesChange={handleNodesChange}
                    />
                )}
            </main>
        </div>
    );
}
