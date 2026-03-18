import { FlowBuilder, type FlowBuilderRef } from "@/features/nodes/presentation/components/flow-builder";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Save, Play, Settings, Loader2, Rocket, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBot, useUpdateBot, useCreateBot, usePublishBot, useArchiveBot } from "../../data/queries/use-bots";
import { toast } from "sonner";
import { useRef } from "react";
import type { Node, Edge } from "@xyflow/react";
import { NodeType } from "@/features/nodes/node-types.constants";

export function BotEditorPage() {
    const { id } = useParams({ from: "/bot/$id" });
    const isNew = id === "new";

    const { data: bot, isLoading } = useBot(id);
    const updateBotMutation = useUpdateBot(id);
    const createBotMutation = useCreateBot();
    const publishBotMutation = usePublishBot();
    const archiveBotMutation = useArchiveBot();

    const flowBuilderRef = useRef<FlowBuilderRef>(null);

    const hasInvalidIntegrationNodes = () => {
        const flowState = flowBuilderRef.current?.getFlowState();
        const sourceNodes = flowState?.nodes ?? initialNodes;
        return sourceNodes.some((node) => {
            if (node.type !== NodeType.OPENAI && node.type !== NodeType.ELEVENLABS) return false;
            const nodeData = node.data as Record<string, unknown>;

            if (node.type === NodeType.ELEVENLABS) {
                return !nodeData["credentialId"] || !nodeData["voiceId"] || !nodeData["text"] || !nodeData["resultVariable"];
            }

            const mode = (nodeData["mode"] as string | undefined) ?? "agent";
            const voiceAction = (nodeData["voiceAction"] as string | undefined) ?? "create_speech";

            if (!nodeData["credentialId"] || !nodeData["model"]) {
                return true;
            }

            if (mode === "agent") {
                return !nodeData["prompt"];
            }

            if (mode === "voice" && voiceAction === "create_speech") {
                return !nodeData["prompt"] || !nodeData["voice"];
            }

            if (mode === "voice" && voiceAction === "create_transcription") {
                return !nodeData["prompt"];
            }

            return false;
        });
    };

    const handleSave = async () => {
        if (!flowBuilderRef.current) return;
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
                                if (hasInvalidIntegrationNodes()) {
                                    toast.error("Integration nodes require required credentials and fields before publish");
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
                    <Button variant="outline" size="sm" className="gap-2">
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
        </div>
    );
}
