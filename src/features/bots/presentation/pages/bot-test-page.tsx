import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Send, Phone, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBot } from "../../data/queries/use-bots";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowBuilder } from "@/features/nodes/presentation/components/flow-builder";
import { toast } from "sonner";
import { chatSessionApi, type StartFlowResult } from "@/features/chatsession/infra/chat-session-api";
import { botsApi } from "../../data/api/bots-api";

export function BotTestPage() {
    const { id } = useParams({ from: "/bot/$id/test" });
    const { data: bot, isLoading } = useBot(id);

    const [phoneNumber, setPhoneNumber] = useState("");
    const [isTriggering, setIsTriggering] = useState(false);
    const [sessionResult, setSessionResult] = useState<StartFlowResult | null>(null);
    const [userReply, setUserReply] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [sessionResult?.outboundMessages, sessionResult?.session.history, sessionResult?.isFinished]);

    console.log("SESSION RESULT", sessionResult)
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!bot) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Bot not found</p>
                <Button asChild>
                    <Link to="/bots">Back to Bots</Link>
                </Button>
            </div>
        );
    }

    // Map backend format back to frontend React Flow format for preview
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
        sourceHandle: e.sourceBranchKey,
        target: e.targetNodeId,
    })) || [];


    const handleTriggerWhatsapp = async () => {
        if (!phoneNumber) {
            toast.error("Please enter a valid phone number");
            return;
        }

        if (!bot?.orgId) {
            toast.error("Bot organization not found");
            return;
        }

        // Ensure flow is published
        if (bot.status !== "published") {
            toast.info("Publishing flow first...");
            try {
                await botsApi.publishBot(id);
                toast.success("Flow published successfully");
            } catch {
                toast.error("Failed to publish flow");
                return;
            }
        }

        setIsTriggering(true);
        try {
            const waId = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
            const mockWaBusinessNumber = "986914541176866";

            const result = await chatSessionApi.startFlow({
                orgId: bot.orgId,
                flowId: id,
                waId: waId,
                waBusinessNumber: mockWaBusinessNumber,
                contactName: `Test User ${waId}`,
                initialVariables: {},
            });

            setSessionResult(result);
            toast.success(`Flow started! Session ID: ${result.session.id}`);
        } catch (error: any) {
            console.error("Failed to start flow:", error);
            toast.error(error?.response?.data?.message || "Failed to trigger flow");
        } finally {
            setIsTriggering(false);
        }
    };

    const handleSendReply = async () => {
        if (!userReply.trim() || !sessionResult?.session.id) return;

        setIsReplying(true);
        try {
            const result = await chatSessionApi.resumeFlow(sessionResult.session.id, {
                userInput: userReply.trim(),
            });

            setSessionResult(result);
            setUserReply("");
            
            if (result.isFinished) {
                toast.success("Flow completed!");
            } else if (result.waitingFor) {
                toast.info("Waiting for user input...");
            }
        } catch (error: any) {
            console.error("Failed to resume flow:", error);
            toast.error(error?.response?.data?.message || "Failed to send reply");
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <div className="flex h-screen w-full flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b px-6 py-3 bg-card/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link to="/bot/$id" params={{ id }}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-semibold tracking-tight">
                            Testing {bot.name}
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            Interactive Test Environment
                        </p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full">
                <Tabs defaultValue="web" className="w-full h-full flex flex-col">
                    <TabsList className="w-fit mb-6">
                        <TabsTrigger value="web" className="gap-2">
                            <Globe size={16} />
                            Web Chatbot
                        </TabsTrigger>
                        <TabsTrigger value="whatsapp" className="gap-2">
                            <Phone size={16} />
                            WhatsApp Simulation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="web" className="flex-1 border rounded-2xl overflow-hidden shadow-sm relative m-0">
                        {/* To-Do: Actual chat simulator UI. For now displaying readonly flow for context */}
                        <div className="absolute inset-0 z-10 pointer-events-none bg-background/20 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="bg-background shadow-xl border p-6 rounded-2xl text-center max-w-sm pointer-events-auto">
                                <Globe className="size-10 text-primary mx-auto mb-4" />
                                <h3 className="font-semibold text-lg mb-2">Web Chat Preview</h3>
                                <p className="text-muted-foreground text-sm mb-6">
                                    Simulated chat interface will appear here. The diagram shows the logic running behind the scenes.
                                </p>
                                <Button className="w-full gap-2 opacity-50 cursor-not-allowed">
                                    Start Chat <ArrowLeft className="size-4 rotate-180" />
                                </Button>
                            </div>
                        </div>
                        <FlowBuilder
                            initialNodes={initialNodes}
                            initialEdges={initialEdges}
                        />
                    </TabsContent>

                    <TabsContent value="whatsapp" className="flex-1 m-0 overflow-y-auto">
                        <div className="flex items-start justify-center min-h-full py-2">
                            {!sessionResult ? (
                                <div className="max-w-md w-full border rounded-2xl p-8 bg-card shadow-sm space-y-6">
                                    <div className="text-center space-y-2">
                                        <div className="bg-emerald-500/10 text-emerald-500 size-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Phone className="size-6" />
                                        </div>
                                        <h2 className="text-xl font-bold">Trigger on WhatsApp</h2>
                                        <p className="text-muted-foreground text-sm">
                                            Enter a phone number to start the conversation on WhatsApp. Make sure your WhatsApp provider is configured.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                                                Phone Number <span className="text-destructive">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                                                    +
                                                </span>
                                                <input
                                                    type="tel"
                                                    className="w-full bg-muted/50 rounded-xl border border-border p-3 pl-7 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                                    placeholder="1234567890"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} // Only digits
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full gap-2 text-base font-bold h-12"
                                            size="lg"
                                            onClick={handleTriggerWhatsapp}
                                            disabled={!phoneNumber || isTriggering}
                                        >
                                            {isTriggering ? (
                                                <Loader2 className="size-5 animate-spin" />
                                            ) : (
                                                <Send className="size-5" />
                                            )}
                                            Send Test Trigger
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-md w-full min-h-[540px] max-h-[calc(100vh-220px)] flex flex-col border rounded-2xl bg-card shadow-sm overflow-hidden">
                                    {/* Chat Header */}
                                    <div className="p-4 border-b bg-emerald-500/10 flex items-center gap-3">
                                        <div className="bg-emerald-500 text-white size-10 rounded-full flex items-center justify-center">
                                            <Phone className="size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{phoneNumber}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                Session: {sessionResult.session.id.slice(-8)}
                                            </p>
                                        </div>
                                        <div className={`size-2 rounded-full ${
                                            sessionResult.isFinished ? 'bg-gray-400' : 
                                            sessionResult.waitingFor ? 'bg-amber-400' : 'bg-emerald-500'
                                        }`} />
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-muted/30">
                                        {sessionResult.outboundMessages.map((msg, idx) => (
                                            <div key={idx} className="flex justify-start">
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] shadow-sm">
                                                    {msg.type === 'send_text' && (
                                                        <p className="text-sm">{msg.payload.message}</p>
                                                    )}
                                                    {msg.type === 'ask_question' && (
                                                        <p className="text-sm">{msg.payload.message}</p>
                                                    )}
                                                    {msg.type === 'send_buttons' && (
                                                        <div className="space-y-2">
                                                            <p className="text-sm">{msg.payload.body}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {msg.payload.buttons?.map((btn: any) => (
                                                                    <button
                                                                        key={btn.id}
                                                                        onClick={() => {
                                                                            setUserReply(btn.id);
                                                                        }}
                                                                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition-colors"
                                                                    >
                                                                        {btn.title}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {msg.type === 'send_list' && (
                                                        <div className="space-y-2">
                                                            <p className="text-sm">{msg.payload.body}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {msg.payload.buttonTitle}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <p className="text-[10px] text-muted-foreground mt-1">Bot</p>
                                                </div>
                                            </div>
                                        ))}
                                        
                                        {sessionResult.session.history.filter(h => h.userInput).map((h, idx) => (
                                            <div key={`user-${idx}`} className="flex justify-end">
                                                <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%] shadow-sm">
                                                    <p className="text-sm">{h.userInput}</p>
                                                    <p className="text-[10px] text-emerald-100 mt-1">You</p>
                                                </div>
                                            </div>
                                        ))}

                                        {sessionResult.isFinished && (
                                            <div className="text-center py-4">
                                                <p className="text-xs text-muted-foreground">Flow completed</p>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input */}
                                    {!sessionResult.isFinished && (
                                        <div className="p-4 border-t bg-card">
                                            {sessionResult.waitingFor ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        className="flex-1 bg-muted rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                        placeholder="Type your reply..."
                                                        value={userReply}
                                                        onChange={(e) => setUserReply(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                                    />
                                                    <Button
                                                        size="icon"
                                                        onClick={handleSendReply}
                                                        disabled={!userReply.trim() || isReplying}
                                                    >
                                                        {isReplying ? (
                                                            <Loader2 className="size-4 animate-spin" />
                                                        ) : (
                                                            <Send className="size-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-center text-muted-foreground">
                                                    Processing...
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
