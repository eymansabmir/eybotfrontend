import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingValidationBannerProps {
    isVisible: boolean;
    isSaving: boolean;
    onSave: () => void;
}

export function FloatingValidationBanner({ isVisible, isSaving, onSave }: FloatingValidationBannerProps) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2"
                >
                    <div className="flex items-center gap-4 rounded-full border border-primary/20 bg-background/80 px-6 py-3 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                            </div>
                            <span className="text-xs font-bold tracking-tight text-foreground/90 uppercase">
                                Unsaved Changes Detected
                            </span>
                        </div>

                        <div className="h-4 w-[1px] bg-border/50" />

                        <Button
                            size="sm"
                            disabled={isSaving}
                            onClick={onSave}
                            className="h-8 rounded-full bg-primary px-6 text-[11px] font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
