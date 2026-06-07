import { FlowBuilder, type FlowBuilderRef } from "@/features/nodes/presentation/components/flow-builder";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertTriangle, Clock, RotateCcw, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { 
    useBot, 
    useUpdateBot, 
    useCreateBot, 
    usePublishBot, 
    useArchiveBot,
    useFlowTranslation,
    useUpdateFlowTranslation,
    useFlowRevisions,
    useRollbackFlow
} from "../../data/queries/use-bots";
import { toast } from "sonner";
import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/features/nodes/node-types.constants";
import { getFlowValidationErrors } from "@/features/bots/domain/flow-validation";
import { useVariablesStore } from "@/features/variables/store";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getErrorMessage } from "@/lib/utils";

import { DEFAULT_NODES, DEFAULT_EDGES } from "@/features/nodes/defaults";
import { BotEditorNavbar } from "../components/bot-editor-navbar";

const MAX_LANGUAGE_NODE_LANGUAGES = 10;
const VALIDATION_TOAST_ID = "flow-validation";


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
    const hasInitialVariablesLoadedRef = useRef(false);


    const [isDirty, setIsDirty] = useState(false);
    const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<"bots" | "settings" | null>(null);

    const { variables, setVariables } = useVariablesStore();
    const isPublished = bot?.status === "published";
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(bot?.name || "");

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const { data: revisions, isLoading: isLoadingRevisions } = useFlowRevisions(id);
    const rollbackMutation = useRollbackFlow(id);

    const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
    const [rollbackTarget, setRollbackTarget] = useState<{ id: string; version: number } | null>(null);

    const handleRollback = useCallback((revisionId: string, versionNumber: number) => {
        if (isPublished) {
            toast.error("Cannot rollback a published flow. Unpublish it first.");
            return;
        }
        setRollbackTarget({ id: revisionId, version: versionNumber });
        setRollbackDialogOpen(true);
    }, [isPublished]);

    const executeRollback = async () => {
        if (!rollbackTarget) return;
        const { id: revisionId, version: versionNumber } = rollbackTarget;

        try {
            const rolledBackBot = await rollbackMutation.mutateAsync(revisionId);
            toast.success(`Successfully rolled back to Version ${versionNumber}!`);

            // Map database representation back to frontend format using our helpers
            const baseNodes = (rolledBackBot?.nodes as any[]) || [];
            const mappedNodes = baseNodes.map((n: any) => mapNodeToFrontend(n, rolledBackBot?.settings?.localization));

            const baseEdges = (rolledBackBot?.edges as any[]) || [];
            const mappedEdges = baseEdges.map(mapEdgeToFrontend);

            // Sync flow builder state
            flowBuilderRef.current?.setFlowState(mappedNodes, mappedEdges);
            resetDirtyState(mappedNodes, mappedEdges);

            setIsHistoryOpen(false);
            setIsDirty(false);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.message || "Failed to rollback";
            toast.error(message);
        } finally {
            setRollbackTarget(null);
            setRollbackDialogOpen(false);
        }
    };

    useEffect(() => {
        if (bot?.name) setTempName(bot.name);
    }, [bot?.name]);

    const [liveLanguages, setLiveLanguages] = useState<string[]>([]);

    const handleNodesChange = useCallback((nodes: Node[]) => {
        // Collect the union of languages from ALL language nodes so that
        // adding/removing a language on any node is immediately reflected
        // in the navbar dropdown without requiring a save.
        const langNodes = nodes.filter(n => n.type === NodeType.LANGUAGE);
        if (langNodes.length > 0) {
            const unionLangs = Array.from(
                new Set(langNodes.flatMap(n => (n.data as any).languages || []))
            ).filter(Boolean) as string[];
            
            setLiveLanguages(prev => {
                if (JSON.stringify(prev) === JSON.stringify(unionLangs)) return prev;
                return unionLangs;
            });
        } else {
            setLiveLanguages(prev => prev.length === 0 ? prev : []);
        }
    }, []);

    useEffect(() => {
        if (hasInitialVariablesLoadedRef.current) return;

        if (bot?.settings?.variables) {
            setVariables(bot.settings.variables as any);
            hasInitialVariablesLoadedRef.current = true;
        } else if (isNew) {
            setVariables([]);
            hasInitialVariablesLoadedRef.current = true;
        }
    }, [bot, isNew, setVariables]);

    const serializeFlowSnapshot = (nodes: Node[], edges: Edge[]) => {
        const nodeSnapshots = nodes
            .map((node) => ({
                id: node.id,
                type: node.type,
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
        
        if (!baselineSnapshotRef.current) {
            baselineSnapshotRef.current = snapshot;
            setIsDirty(false);
            return;
        }

        const newDirtyStatus = snapshot !== baselineSnapshotRef.current;
        setIsDirty((prev) => {
            if (prev === newDirtyStatus) return prev;
            return newDirtyStatus;
        });

        // Variable syncing is now handled exclusively by explicit user actions via Variable Manager and Select components.
    }, []);
    useEffect(() => {
        // Cleanup function for any timeouts if added in the future
        return () => {};
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
                message: n.data.message || n.data.question || "Default question",
                variableName: n.data.variableName || n.data.variable || "var",
                variableScope: n.data.variableScope || "session",
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
        } else if (n.type === NodeType.JUMP) {
            branches = [{ key: "next", label: "Next" }];
        } else {
            if (!branches.length) {
                branches = [{ key: "default", label: "Default" }];
            }
        }

        return {
            id: n.id,
            type: n.type,
            label: (n.data as any).label || n.type,
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



    const mapNodeToFrontend = useCallback((n: any, settingsLocalization: any) => {
        let frontendData = { ...n.data };
        if (n.type === "ask_question") {
            frontendData = {
                ...frontendData,
                question: n.data.message || "",
                message: n.data.message || "",
                variable: n.data.variableName || "var",
                variableName: n.data.variableName || "var",
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
            const nodeLangs = Array.isArray(n.data.languages) ? n.data.languages : [];
            const languageList = nodeLangs.length > 0
                ? nodeLangs.slice(0, MAX_LANGUAGE_NODE_LANGUAGES)
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
    }, [isTranslationMode]);

    const mapEdgeToFrontend = useCallback((e: any) => ({
        id: e.id,
        source: e.sourceNodeId || e.source,
        sourceHandle: e.sourceBranchKey === "default" ? undefined : (e.sourceBranchKey || e.sourceHandle),
        target: e.targetNodeId || e.target,
    }), []);

    const initialEdges = useMemo(() => {
        const baseEdges = bot?.edges || [];
        const sourceEdges = baseEdges.length > 0 ? baseEdges : (isNew ? DEFAULT_EDGES : []);
        
        return (sourceEdges as any[]).map(mapEdgeToFrontend);
    }, [bot?.edges, isNew, mapEdgeToFrontend]);

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

    const handleSave = async (): Promise<boolean> => {
        if (!flowBuilderRef.current) return false;

        const { nodes: localNodes, edges: localEdges } = flowBuilderRef.current.getFlowState();

        if (isTranslationMode) {
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
                    backendData = { ...backendData, message: n.data.message || n.data.question, variableName: n.data.variableName || n.data.variable, inputType: n.data.validationType };
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
                toast.error(getErrorMessage(err, "Failed to save translation."));
                return false;
            }
        }

        const validationErrors = getFlowValidationErrors(localNodes);
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
            toast.error(getErrorMessage(error, "Failed to save bot."), { duration: 8000 });
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
            // Strip trigger config to prevent duplicate trigger errors on import
            triggerConfig: {
                enabled: false,
                logicalOperator: "OR",
                comparisons: [],
                keywords: [],
            },
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
        toast.success("Flow exported successfully (Triggers cleared for template use)");
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
            toast.error(getErrorMessage(error, "Failed to rename bot."));
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
                onError: (err) => toast.error(getErrorMessage(err, "Failed to publish bot")),
            });
        } catch {}
    };

    const handleUnpublish = () => {
        archiveBotMutation.mutate(id, {
            onSuccess: () => toast.success("Bot archived. You can now edit it."),
            onError: (err) => toast.error(getErrorMessage(err, "Failed to archive bot")),
        });
    };

    const initialNodes = useMemo(() => {
        const baseNodes = (bot?.nodes as any[]) || [];
        const translatedSource = translationData?.translatedData as any[] | undefined;

        // --- MERGE STRATEGY ---
        // If in translation mode, we use baseNodes as the primary structure (to keep technical settings)
        // and only override specific content fields from the translations.
        const sourceNodes = isTranslationMode && translatedSource
            ? baseNodes.map((base: any) => {
                const translation = translatedSource.find(t => t.id === base.id);
                if (!translation) return base;

                // Merge rule: Keep the MASTER flow structure and logic
                // only override text fields for the translation view.
                const tData = translation.data || {};

                return {
                    ...base,
                    data: {
                        ...base.data,
                        ...tData, // Overwrites labels/messages
                    }
                };
            })
            : (baseNodes.length > 0 ? baseNodes : (isNew ? DEFAULT_NODES : []));

        return sourceNodes.map(n => mapNodeToFrontend(n, bot?.settings?.localization)) || [];
    }, [bot?.nodes, bot?.settings?.localization, translationData, isTranslationMode, mapNodeToFrontend, isNew]);

    const lastSyncedNodesRef = useRef<string>("");
    useEffect(() => {
        if (initialNodes.length === 0) return;
        
        const nodesHash = JSON.stringify(initialNodes.map(n => ({ id: n.id, type: n.type, data: n.data })));
        if (nodesHash === lastSyncedNodesRef.current) return;
        
        lastSyncedNodesRef.current = nodesHash;
    }, [initialNodes]);

    useEffect(() => {
        const langNodes = initialNodes.filter(n => n.type === NodeType.LANGUAGE);
        const unionLangs = Array.from(
            new Set(langNodes.flatMap(n => (n.data as any).languages || []))
        ).filter(Boolean) as string[];
        
        setLiveLanguages(prev => {
            if (JSON.stringify(prev) === JSON.stringify(unionLangs)) return prev;
            return unionLangs;
        });
    }, [initialNodes]);

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

            <AlertDialog open={rollbackDialogOpen} onOpenChange={setRollbackDialogOpen}>
                <AlertDialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-amber-50 dark:bg-amber-950/20 px-6 py-5 flex items-center gap-3 border-b border-amber-100 dark:border-amber-900/30">
                        <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                            <RotateCcw className="size-6" />
                        </div>
                        <AlertDialogTitle className="text-lg font-bold text-amber-900 dark:text-amber-200">Confirm Rollback</AlertDialogTitle>
                    </div>
                    
                    <div className="p-6">
                        <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground/90 font-medium">
                            Are you sure you want to rollback to <strong>Version {rollbackTarget?.version}</strong>? All current unsaved edits will be replaced and permanently discarded.
                        </AlertDialogDescription>
                    </div>

                    <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
                        <AlertDialogCancel className="mt-0 h-10 rounded-full border-border/50 px-6 text-xs font-semibold hover:bg-muted transition-colors">
                            Cancel
                        </AlertDialogCancel>
                        
                        <AlertDialogAction
                            className="h-10 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-all text-xs font-bold px-6"
                            onClick={executeRollback}
                        >
                            Confirm Rollback
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
                onToggleHistory={() => setIsHistoryOpen(prev => !prev)}
                isHistoryOpen={isHistoryOpen}
            />

            <main className="relative flex-1 overflow-hidden flex flex-row">
                <div className="flex-1 h-full relative overflow-hidden">
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
                </div>

                {/* Right-Side Version History Drawer */}
                <div
                    className={`absolute top-0 right-0 z-30 h-full w-80 bg-background/95 backdrop-blur-md border-l border-border shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform ${
                        isHistoryOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-2">
                            <History className="size-4 text-primary" />
                            <h2 className="text-sm font-bold tracking-tight text-foreground">Version History</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full hover:bg-muted/80"
                            onClick={() => setIsHistoryOpen(false)}
                        >
                            <X className="size-4 text-muted-foreground" />
                        </Button>
                    </div>

                    <div className="p-3 bg-primary/5 border-b border-primary/10">
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Restoring a version will overwrite current unsaved edits. Published bots cannot be rolled back directly.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {isLoadingRevisions ? (
                            <div className="flex flex-col items-center justify-center h-48 gap-2">
                                <Loader2 className="size-6 animate-spin text-primary" />
                                <span className="text-[10px] text-muted-foreground font-semibold">Loading revisions...</span>
                            </div>
                        ) : !revisions || revisions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                                <Clock className="size-8 text-muted-foreground/30 mb-2" />
                                <h3 className="text-xs font-bold text-foreground/80 mb-1">No Published Versions Yet</h3>
                                <p className="text-[10px] text-muted-foreground leading-normal">
                                    Revisions are captured automatically when you publish your bot.
                                </p>
                            </div>
                        ) : (
                            revisions.map((rev: any) => {
                                const formattedDate = rev.createdAt
                                    ? formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })
                                    : "unknown time";
                                
                                return (
                                    <div
                                        key={rev.id}
                                        className="group relative flex flex-col gap-2 p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-foreground">
                                                        Version {rev.version}
                                                    </span>
                                                    {isPublished && rev.isPublished && (
                                                         <span className="text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded tracking-wider shadow-sm">
                                                             Published
                                                         </span>
                                                     )}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1 font-medium">
                                                    <Clock className="size-3 shrink-0" />
                                                    {formattedDate}
                                                </span>
                                            </div>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={isPublished || rollbackMutation.isPending}
                                                className="h-7 px-2.5 rounded-full font-bold text-[10px] gap-1 border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                                                onClick={() => handleRollback(rev.id, rev.version)}
                                            >
                                                {rollbackMutation.isPending && rollbackMutation.variables === rev.id ? (
                                                    <Loader2 className="size-2.5 animate-spin" />
                                                ) : (
                                                    <RotateCcw className="size-2.5" />
                                                )}
                                                Restore
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
