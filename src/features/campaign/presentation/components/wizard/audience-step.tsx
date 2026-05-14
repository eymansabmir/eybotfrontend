import { useMemo } from "react";
import { Info, Variable } from "lucide-react";
import { CsvUploader } from "../CsvUploader";
import { useBot } from "@/features/bots/data/queries/use-bots";

interface AudienceStepProps {
    filePath: string;
    onFileUploaded: (path: string) => void;
    botId: string;
}

export function AudienceStep({ filePath, onFileUploaded, botId }: AudienceStepProps) {
    const { data: bot } = useBot(botId);

    // Identify dynamic variables used in the bot
    const botVariables = useMemo(() => {
        if (!bot?.nodes) return [];
        const vars = new Set<string>();
        const findVars = (obj: any) => {
            if (typeof obj === "string") {
                const matches = obj.matchAll(/\{\{session\.([^}]+)\}\}/g);
                for (const match of matches) {
                    const varName = match[1];
                    // Filter out common internal variables
                    if (!['history', 'last_message', 'waId'].includes(varName)) {
                        vars.add(varName);
                    }
                }
            } else if (obj && typeof obj === "object") {
                Object.values(obj).forEach(findVars);
            }
        };
        findVars(bot.nodes);
        return Array.from(vars);
    }, [bot]);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Audience</h3>
                <p className="text-sm text-muted-foreground">
                    Upload your audience list to start the campaign.
                </p>
            </div>

            <CsvUploader
                onUploadSuccess={onFileUploaded}
                label="Upload CSV or Excel file"
            />

            {filePath && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ File uploaded successfully
                </p>
            )}

            {/* Variable Discovery Tooltip */}
            {botVariables.length > 0 && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Variable className="size-4 text-primary" />
                        <h4 className="text-sm font-semibold text-primary">
                            Bot Requirements
                        </h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                        To personalize your messages, ensure your CSV includes columns matching these variable names:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {botVariables.map(v => (
                            <code key={v} className="rounded-md bg-background border border-border px-2 py-1 text-[10px] font-mono text-foreground shadow-sm">
                                {v}
                            </code>
                        ))}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="size-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Tips for success
                    </h4>
                </div>
                <ul className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        Use international phone format (+1 234 567 890)
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        Columns with <code className="rounded bg-blue-100 dark:bg-blue-900 px-1">req_</code> prefix are automatically used as variables.
                    </li>
                </ul>
            </div>
        </div>
    );
}
