import { useMemo, useState } from "react";
import { Variable, Database, FileSpreadsheet, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CsvUploader } from "../CsvUploader";
import { useBot } from "@/features/bots/data/queries/use-bots";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataSources, useDiscover, useDiscoverColumns } from "@/features/integrations/hooks/use-connectors";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AudienceStepProps {
    filePath: string;
    onFileUploaded: (path: string) => void;
    botId: string;
    sourceType: 'CSV' | 'DB2DB';
    onSourceTypeChange: (type: 'CSV' | 'DB2DB') => void;
    selectedDataSourceId?: string;
    onDataSourceChange: (id: string) => void;
    selectedView?: string;
    onViewChange: (view: string) => void;
    onValidityChange: (isValid: boolean) => void;
}

export function AudienceStep({ 
    filePath, 
    onFileUploaded, 
    botId, 
    sourceType, 
    onSourceTypeChange,
    selectedDataSourceId,
    onDataSourceChange,
    selectedView,
    onViewChange,
    onValidityChange
}: AudienceStepProps) {
    const { data: bot } = useBot(botId);
    const { data: sources = [] } = useDataSources();
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    
    const { data: tables = [], isLoading: loadingTables } = useDiscover(selectedDataSourceId);
    const { data: columns = [], isLoading: loadingColumns } = useDiscoverColumns(selectedDataSourceId, selectedView);
    
    const botVariables = useMemo(() => {
        if (!bot?.nodes) return [];
        const vars = new Set<string>();
        const findVars = (obj: any) => {
            if (typeof obj === "string") {
                const matches = obj.matchAll(/\{\{session\.([^}]+)\}\}/g);
                for (const match of matches) {
                    const varName = match[1];
                    if (!['history', 'last_message', 'waId'].includes(varName)) vars.add(varName);
                }
            } else if (obj && typeof obj === "object") {
                Object.values(obj).forEach(findVars);
            }
        };
        findVars(bot.nodes);
        return Array.from(vars);
    }, [bot]);

    const activeColumns = useMemo(() => {
        return sourceType === 'CSV' ? csvHeaders : columns;
    }, [sourceType, csvHeaders, columns]);

    const validation = useMemo(() => {
        const isSelected = sourceType === 'CSV' ? filePath : selectedView;
        if (!isSelected) return { valid: false, missing: [] }; // Cannot continue if nothing selected
        if (sourceType === 'DB2DB' && loadingColumns) return { valid: true, missing: [] }; // Allow loading state
        
        const required = ['phone', ...botVariables];
        const missing = required.filter((v: string) => 
            !activeColumns.includes(v) && 
            !activeColumns.some((c: string) => c.toLowerCase() === v.toLowerCase()) &&
            !activeColumns.some((c: string) => c.toLowerCase() === `req_${v.toLowerCase()}`)
        );
        return { valid: missing.length === 0, missing };
    }, [sourceType, filePath, selectedView, activeColumns, botVariables, loadingColumns]);

    // Report validity to parent
    useMemo(() => {
        onValidityChange(validation.valid);
    }, [validation.valid, onValidityChange]);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full space-y-6 overflow-hidden">
                {/* Header: Compact & Professional */}
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-0.5">
                        <h3 className="text-lg font-bold tracking-tight">Ingestion Source</h3>
                        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Configure your recipient pipeline</p>
                    </div>
                    
                    {/* Premium Segmented Toggle */}
                    <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
                        <button 
                            onClick={() => onSourceTypeChange('CSV')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                sourceType === 'CSV' ? "bg-background shadow-sm text-primary ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileSpreadsheet className="size-3.5" />
                            CSV Data
                        </button>
                        <button 
                            onClick={() => onSourceTypeChange('DB2DB')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                sourceType === 'DB2DB' ? "bg-background shadow-sm text-primary ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Database className="size-3.5" />
                            DB Sync
                        </button>
                    </div>
                </div>

                {/* Scrollable Container with Fade */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                    {sourceType === 'CSV' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="relative p-1 rounded-3xl bg-muted/20 border border-dashed border-border group hover:border-primary/50 transition-colors">
                                <CsvUploader
                                    onUploadSuccess={onFileUploaded}
                                    onHeadersExtracted={setCsvHeaders}
                                    label="Drop campaign dataset here"
                                />
                                <div className="absolute top-4 right-4">
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="size-4 text-muted-foreground hover:text-primary transition-colors" />
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="max-w-[240px] text-[11px] p-3 space-y-2">
                                            <p className="font-bold">Pro-Tip: Auto-Mapping</p>
                                            <p>Prefix columns with <code className="bg-muted px-1 rounded">req_</code> to automatically fill variables.</p>
                                            <p className="opacity-70">Example: <code className="bg-muted px-1 rounded">req_name</code> maps to <code className="bg-muted px-1 rounded">{"{{session.name}}"}</code></p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            
                            {filePath && (
                                <div className="space-y-4">
                                    <div className={cn(
                                        "px-4 py-3 rounded-xl border flex items-center justify-between animate-in zoom-in-95",
                                        validation.valid ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {validation.valid ? <CheckCircle2 className="size-4 text-green-500" /> : <AlertCircle className="size-4 text-destructive" />}
                                            <span className={cn("text-xs font-bold", validation.valid ? "text-green-700" : "text-destructive")}>
                                                {validation.valid ? "File Validated & Ready" : "Column Mismatch in CSV"}
                                            </span>
                                        </div>
                                        {validation.valid && <Badge variant="outline" className="h-5 text-[9px] bg-background">DATASET VERIFIED</Badge>}
                                    </div>
                                    
                                    {!validation.valid && (
                                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 flex gap-3">
                                            <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-destructive leading-relaxed">
                                                Your CSV is missing columns for: <span className="font-mono font-bold">{validation.missing.join(', ')}</span>. 
                                                Please update the file and re-upload.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Compact DB Selectors */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Infrastructure</Label>
                                    <Select value={selectedDataSourceId} onValueChange={onDataSourceChange}>
                                        <SelectTrigger className="h-10 bg-muted/30 border-transparent rounded-lg text-xs">
                                            <SelectValue placeholder="Select Connection" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sources.map((s: any) => (
                                                <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2 relative">
                                    <div className="flex items-center justify-between ml-1 mb-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source View</Label>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <HelpCircle className="size-3 text-muted-foreground hover:text-primary transition-colors" />
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="max-w-[200px] text-[10px] p-2">
                                                Use <code className="bg-muted px-1 rounded">AS</code> to map columns.
                                                <br/>Example: <code className="bg-muted px-1 rounded text-[8px]">SELECT mobile AS phone...</code>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Select value={selectedView} onValueChange={onViewChange} disabled={!selectedDataSourceId || loadingTables}>
                                        <SelectTrigger className="h-10 bg-muted/30 border-transparent rounded-lg text-xs">
                                            <SelectValue placeholder={loadingTables ? "Fetching..." : "Select View"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tables.map((t: any) => (
                                                <SelectItem key={t.name} value={t.name} className="text-xs">
                                                    <span className="opacity-50 mr-2">[{t.type[0]}]</span>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedView && (
                                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                    {/* Schema Status Header */}
                                    <div className={cn(
                                        "px-4 py-3 rounded-xl border flex items-center justify-between",
                                        validation.valid ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {validation.valid ? <CheckCircle2 className="size-4 text-green-500" /> : <AlertCircle className="size-4 text-destructive" />}
                                            <span className={cn("text-xs font-bold", validation.valid ? "text-green-700" : "text-destructive")}>
                                                {validation.valid ? "Schema Handshake Successful" : "Schema Mismatch Detected"}
                                            </span>
                                        </div>
                                        {validation.valid && <Badge variant="outline" className="h-5 text-[9px] bg-background">CONTRACT VERIFIED</Badge>}
                                    </div>
                                    
                                    {!validation.valid && (
                                        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 flex gap-3">
                                            <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-destructive leading-relaxed">
                                                The view is missing: <span className="font-mono font-bold">{validation.missing.join(', ')}</span>.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mapping Table: Now visible for both CSV and DB when selected */}
                    {(sourceType === 'CSV' ? filePath : selectedView) && (
                        <div className="animate-in fade-in duration-500">
                            <div className="rounded-xl border bg-card/50 overflow-hidden shadow-sm">
                                <table className="w-full text-[11px]">
                                    <thead className="bg-muted/50 border-b">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-bold text-muted-foreground uppercase">Bot Requirement</th>
                                            <th className="px-4 py-2 text-left font-bold text-muted-foreground uppercase">Source Column</th>
                                            <th className="px-4 py-2 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {['phone', ...botVariables].map((v: string) => {
                                            const matchedColumn = activeColumns.find((c: string) => 
                                                c.toLowerCase() === v.toLowerCase() || 
                                                c.toLowerCase() === `req_${v.toLowerCase()}` ||
                                                (v === 'phone' && ['wa_id', 'mobile', 'recipient'].includes(c.toLowerCase()))
                                            );
                                            return (
                                                <tr key={v} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-4 py-2.5 font-mono font-bold text-foreground/80">{v}</td>
                                                    <td className="px-4 py-2.5">
                                                        {matchedColumn ? (
                                                            <span className="text-primary font-medium">{matchedColumn}</span>
                                                        ) : (
                                                            <span className="text-destructive italic opacity-60">Missing</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right">
                                                        {matchedColumn ? <CheckCircle2 className="size-3 text-green-500 ml-auto" /> : <AlertCircle className="size-3 text-destructive ml-auto" />}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Requirements Footer */}
                    {botVariables.length > 0 && (
                        <div className="p-4 rounded-xl border-t bg-muted/10">
                            <div className="flex items-center gap-2 mb-3">
                                <Variable className="size-3.5 text-primary" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Required Schema</h4>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                <Badge variant="secondary" className="rounded-md font-mono text-[9px] bg-background border border-border/50">phone (Required)</Badge>
                                {botVariables.map(v => (
                                    <Badge key={v} variant="outline" className="rounded-md font-mono text-[9px] bg-background">
                                        {v}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}

