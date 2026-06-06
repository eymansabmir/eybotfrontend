import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useCreateCampaign, useUpdateCampaign, useStartCampaign } from "../../api/campaign-queries";
import type { ExecutionMode, Campaign } from "../../types";

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
    initialCampaign?: Campaign | null;
}

export function CreateCampaignDialog({ open, onOpenChange, initialCampaign }: CreateCampaignDialogProps) {
    const [step, setStep] = useState(0);

    // Form state
    const [title, setTitle] = useState("");
    const [botId, setBotId] = useState("");
    const [filePath, setFilePath] = useState("");
    const [sourceType, setSourceType] = useState<'CSV' | 'DB2DB' | 'API' | 'CUSTOM_API'>('CSV');
    const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | undefined>();
    const [selectedView, setSelectedView] = useState<string | undefined>();
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [filters, setFilters] = useState<string[]>([]);
    const [executionMode, setExecutionMode] = useState<ExecutionMode>("NOW");
    const [executeAt, setExecuteAt] = useState("");
    const [isAudienceValid, setIsAudienceValid] = useState(false);

    const createMutation = useCreateCampaign();
    const updateMutation = useUpdateCampaign();
    const startMutation = useStartCampaign();

    const isRerunMode = !!initialCampaign;

    const resetForm = useCallback(() => {
        setStep(0);
        setTitle("");
        setBotId("");
        setFilePath("");
        setSourceType('CSV');
        setSelectedDataSourceId(undefined);
        setSelectedView(undefined);
        setFieldMapping({});
        setFilters([]);
        setExecutionMode("NOW");
        setExecuteAt("");
        setIsAudienceValid(false);
    }, []);

    // Initialize state when open and initialCampaign changes
    useEffect(() => {
        if (open && initialCampaign) {
            setStep(0);
            setTitle(initialCampaign.name);
            setBotId(initialCampaign.flowId);
            setSourceType('CUSTOM_API'); // Rerun is only for API/CUSTOM_API currently based on context, but let's assume it based on dataSourceId
            setSelectedDataSourceId(initialCampaign.dataSourceId || undefined);
            setSelectedView(initialCampaign.tableName || undefined);
            setFieldMapping(initialCampaign.fieldMapping || {});
            setFilters(initialCampaign.filters as string[] || []);
            setExecutionMode(initialCampaign.scheduleTime ? "SCHEDULED" : "NOW");
            setExecuteAt(initialCampaign.scheduleTime ? new Date(initialCampaign.scheduleTime).toISOString().slice(0, 16) : "");
            setIsAudienceValid(true); // Assuming valid since it was created before
        } else if (open && !initialCampaign) {
            resetForm();
        }
    }, [open, initialCampaign, resetForm]);

    const handleClose = useCallback(() => {
        onOpenChange(false);
        // Delay reset so close animation finishes
        setTimeout(resetForm, 200);
    }, [onOpenChange, resetForm]);

    // Per-step validation
    const canContinue = (() => {
        if (step === 0) return title.trim().length > 0 && botId.trim().length > 0;
        if (step === 1) return isAudienceValid || sourceType === 'API';
        if (step === 2) {
            if (executionMode === "SCHEDULED") return executeAt.length > 0;
            return true;
        }
        return false;
    })();

    const handleSubmit = async () => {
        try {
            if (isRerunMode && initialCampaign) {
                // Update the limits and reset the page
                const updatedFieldMapping = {
                    ...fieldMapping,
                    apiCurrentPage: 1, // Force reset to page 1
                };
                
                await updateMutation.mutateAsync({
                    id: initialCampaign.id,
                    input: {
                        fieldMapping: updatedFieldMapping,
                    }
                });

                // Trigger start on the existing campaign
                await startMutation.mutateAsync(initialCampaign.id);
            } else {
                await createMutation.mutateAsync({
                    name: title.trim(),
                    flowId: botId.trim(),
                    filePath: sourceType === 'CSV' ? filePath : undefined,
                    dataSourceId: sourceType === 'DB2DB' ? selectedDataSourceId : (sourceType === 'CUSTOM_API' ? 'CUSTOM_API' : undefined),
                    tableName: sourceType === 'DB2DB' ? selectedView : undefined,
                    fieldMapping: sourceType === 'CUSTOM_API' ? fieldMapping : undefined,
                    filters: sourceType === 'CUSTOM_API' && filters.length > 0 ? filters : undefined,
                    // If API, we don't send file or DB info, backend will create a 'WAITING_FOR_API' style campaign
                    scheduleTime: executionMode === "SCHEDULED" ? new Date(executeAt).toISOString() : undefined,
                });
            }
        } catch {
            // Error handled via onError toast in mutation hook
            return;
        }
        handleClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[90vw] p-0 overflow-hidden border-none shadow-2xl rounded-3xl h-[750px] max-h-[90vh]">
                <div className="flex h-full w-full bg-background overflow-hidden">
                    {/* Left: Stepper Sidebar */}
                    <StepperSidebar steps={STEPS} currentStep={step} />

                    <div className="flex flex-col h-full overflow-hidden flex-1">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-8 pb-20">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex-1 flex flex-col overflow-hidden"
                                >
                                    {step === 0 && (
                                        <CampaignDetailsStep
                                            title={title}
                                            onTitleChange={setTitle}
                                            botId={botId}
                                            onBotIdChange={setBotId}
                                            isRerunMode={isRerunMode}
                                        />
                                    )}
                                    {step === 1 && (
                                        <AudienceStep
                                            filePath={filePath}
                                            onFileUploaded={setFilePath}
                                            botId={botId}
                                            sourceType={sourceType}
                                            onSourceTypeChange={setSourceType}
                                            selectedDataSourceId={selectedDataSourceId}
                                            onDataSourceChange={setSelectedDataSourceId}
                                            selectedView={selectedView}
                                            onViewChange={setSelectedView}
                                            fieldMapping={fieldMapping}
                                            onFieldMappingChange={setFieldMapping}
                                            filters={filters}
                                            onFiltersChange={setFilters}
                                            onValidityChange={setIsAudienceValid}
                                            isRerunMode={isRerunMode}
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
                                            isRerunMode={isRerunMode}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            </div>
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
                                        disabled={!canContinue || createMutation.isPending || updateMutation.isPending || startMutation.isPending}
                                    >
                                        {createMutation.isPending || updateMutation.isPending || startMutation.isPending ? (isRerunMode ? "Updating..." : "Creating...") : (isRerunMode ? "Rerun Campaign" : "Create Campaign")}
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
