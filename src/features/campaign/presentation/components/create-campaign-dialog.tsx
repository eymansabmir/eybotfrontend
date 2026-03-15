import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useCreateCampaign } from "../../api/campaign-queries";
import type { ExecutionMode } from "../../types";

import { StepperSidebar, type StepConfig } from "./wizard/stepper-sidebar";
import { CampaignDetailsStep } from "./wizard/campaign-details-step";
import { AudienceStep } from "./wizard/audience-step";
import { ScheduleStep } from "./wizard/schedule-step";

const STEPS: StepConfig[] = [
    { title: "Campaign details", description: "Name your campaign and select a bot" },
    { title: "Audience", description: "Upload your recipient list" },
    { title: "Schedule", description: "Choose when to send" },
];

interface CreateCampaignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
    const [step, setStep] = useState(0);

    // Form state
    const [title, setTitle] = useState("");
    const [botId, setBotId] = useState("");
    const [filePath, setFilePath] = useState("");
    const [executionMode, setExecutionMode] = useState<ExecutionMode>("NOW");
    const [executeAt, setExecuteAt] = useState("");

    const createMutation = useCreateCampaign();

    const resetForm = useCallback(() => {
        setStep(0);
        setTitle("");
        setBotId("");
        setFilePath("");
        setExecutionMode("NOW");
        setExecuteAt("");
    }, []);

    const handleClose = useCallback(() => {
        onOpenChange(false);
        // Delay reset so close animation finishes
        setTimeout(resetForm, 200);
    }, [onOpenChange, resetForm]);

    // Per-step validation
    const canContinue = (() => {
        if (step === 0) return title.trim().length > 0 && botId.trim().length > 0;
        if (step === 1) return filePath.length > 0;
        if (step === 2) {
            if (executionMode === "SCHEDULED") return executeAt.length > 0;
            return true;
        }
        return false;
    })();

    const handleSubmit = async () => {
        try {
            await createMutation.mutateAsync({
                name: title.trim(),
                flowId: botId.trim(),
                filePath,
                scheduleTime: executionMode === "SCHEDULED" ? new Date(executeAt).toISOString() : undefined,
            });
        } catch {
            // Error handled via onError toast in mutation hook
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[950px] p-0 gap-0 overflow-hidden h-[600px] md:h-[650px]">
                <div className="grid grid-cols-[280px_1fr] h-full">
                    {/* Left: Stepper Sidebar */}
                    <StepperSidebar steps={STEPS} currentStep={step} />

                    {/* Right: Step Content */}
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {step === 0 && (
                                        <CampaignDetailsStep
                                            title={title}
                                            onTitleChange={setTitle}
                                            botId={botId}
                                            onBotIdChange={setBotId}
                                        />
                                    )}
                                    {step === 1 && (
                                        <AudienceStep
                                            filePath={filePath}
                                            onFileUploaded={setFilePath}
                                        />
                                    )}
                                    {step === 2 && (
                                        <ScheduleStep
                                            title={title}
                                            botId={botId}
                                            filePath={filePath}
                                            executionMode={executionMode}
                                            onModeChange={setExecutionMode}
                                            executeAt={executeAt}
                                            onExecuteAtChange={setExecuteAt}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border px-6 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-4 bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                                Step {step + 1} of {STEPS.length}
                            </p>
                            <div className="flex items-center gap-2">
                                {step === 0 ? (
                                    <Button variant="outline" onClick={handleClose}>
                                        Cancel
                                    </Button>
                                ) : (
                                    <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                                        Back
                                    </Button>
                                )}

                                {step < STEPS.length - 1 ? (
                                    <Button
                                        onClick={() => setStep((s) => s + 1)}
                                        disabled={!canContinue}
                                    >
                                        Continue
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!canContinue || createMutation.isPending}
                                    >
                                        {createMutation.isPending ? "Creating..." : "Create Campaign"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
