import { Info } from "lucide-react";
import { CsvUploader } from "../CsvUploader";

interface AudienceStepProps {
    filePath: string;
    onFileUploaded: (path: string) => void;
}

export function AudienceStep({ filePath, onFileUploaded }: AudienceStepProps) {
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

            {/* Tips */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="size-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Tips for a clean contact list
                    </h4>
                </div>
                <ul className="space-y-2 text-xs text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        Use international phone format (+1 234 567 890)
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        Include optional columns such as <code className="rounded bg-blue-100 dark:bg-blue-900 px-1">first_name</code>, <code className="rounded bg-blue-100 dark:bg-blue-900 px-1">last_name</code>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        Ensure all recipients have given explicit opt-in consent
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        Remove duplicates before uploading for best results
                    </li>
                </ul>
            </div>
        </div>
    );
}
