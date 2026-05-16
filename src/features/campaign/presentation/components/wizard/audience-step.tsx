import { useMemo, useState } from "react";
import { 
  Variable, 
  Database, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Code2, 
  Terminal, 
  Copy,
  Info,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { CsvUploader } from "../CsvUploader";
import { useBot } from "@/features/bots/data/queries/use-bots";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataSources, useDiscover, useDiscoverColumns } from "@/features/integrations/hooks/use-connectors";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { toast } from "sonner";

export interface AudienceStepProps {
    filePath: string;
    onFileUploaded: (path: string) => void;
    botId: string;
    sourceType: 'CSV' | 'DB2DB' | 'API';
    onSourceTypeChange: (type: 'CSV' | 'DB2DB' | 'API') => void;
    selectedDataSourceId?: string;
    onDataSourceChange: (id: string) => void;
    selectedView?: string;
    onViewChange: (view: string) => void;
    onValidityChange: (isValid: boolean) => void;
}

const PHONE_ALIASES = ['phone', 'wa_id', 'mobile', 'recipient', 'waid', 'phone_number', 'number', 'to'];

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
        if (sourceType === 'API') return { valid: true, missing: [] }; 
        
        const isSelected = sourceType === 'CSV' ? filePath : selectedView;
        if (!isSelected) return { valid: false, missing: [] }; 
        if (sourceType === 'DB2DB' && loadingColumns) return { valid: true, missing: [] }; 
        
        const required = ['phone', ...botVariables];
        const missing = required.filter(v => {
            // Check direct match
            if (activeColumns.includes(v)) return false;
            // Check case-insensitive
            if (activeColumns.some((c: string) => c.toLowerCase() === v.toLowerCase())) return false;
            // Check req_ prefix
            if (activeColumns.some((c: string) => c.toLowerCase() === `req_${v.toLowerCase()}`)) return false;
            // Special case for phone aliases
            if (v === 'phone' && activeColumns.some((c: string) => PHONE_ALIASES.includes(c.toLowerCase()))) return false;
            
            return true;
        });
        return { valid: missing.length === 0, missing };
    }, [sourceType, filePath, selectedView, activeColumns, botVariables, loadingColumns]);

    // Report validity to parent
    useMemo(() => {
        onValidityChange(validation.valid);
    }, [validation.valid, onValidityChange]);

    const API_DOCS = [
        {
            title: "Authentication Token",
            desc: "Obtain a bearer token using your App ID and Secret.",
            endpoint: "POST /api/v1/auth/token",
            tooltip: "Generate these credentials in Settings > API Access.",
            payload: {
                appId: "roi_live_...",
                appSecret: "..."
            },
            headers: { "Content-Type": "application/json" }
        },
        {
            title: "Trigger Campaign",
            desc: "Ingest batch data into a managed campaign workflow.",
            endpoint: "POST /api/v1/trigger",
            payload: {
                botId: botId,
                campaignName: "Marketing_Batch_" + new Date().toISOString().split('T')[0],
                executionMode: "NOW",
                data: [
                    { 
                        to: "919999999999", 
                        variables: botVariables.reduce((acc, v) => ({ ...acc, [v]: "value" }), {})
                    }
                ]
            },
            headers: { 
                "Authorization": "Bearer <token>",
                "Content-Type": "application/json" 
            }
        },
        {
            title: "Direct Bot Initiation",
            desc: "Instantly launch a bot session for specific recipients.",
            endpoint: "POST /api/v1/trigger/initiate",
            payload: {
                botId: botId,
                data: [
                    { 
                        to: "918888888888", 
                        variables: botVariables.reduce((acc, v) => ({ ...acc, [v]: "value" }), {})
                    }
                ]
            },
            headers: { 
                "Authorization": "Bearer <token>",
                "Content-Type": "application/json" 
            }
        }
    ];

    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-4 shrink-0">
                    <div className="space-y-0.5">
                        <h3 className="text-lg font-bold tracking-tight">Ingestion Source</h3>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Configure your recipient pipeline</p>
                    </div>
                    
                    <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50 shadow-inner">
                        {[
                            { id: 'CSV', icon: FileSpreadsheet, label: 'CSV' },
                            { id: 'DB2DB', icon: Database, label: 'DB Sync' },
                            { id: 'API', icon: Code2, label: 'API' }
                        ].map((t) => (
                            <button 
                                key={t.id}
                                onClick={() => onSourceTypeChange(t.id as any)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200",
                                    sourceType === t.id ? "bg-background shadow-sm text-primary ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <t.icon className="size-3" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="space-y-6 pb-12">
                    {sourceType === 'API' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                            <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/20 flex gap-5 items-start">
                                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <Terminal className="size-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold tracking-tight">Developer Integration Toolkit</h4>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
                                        Automate bot triggers by integrating these endpoints into your CRM or backend. Authentication is required via the Client Credentials flow.
                                    </p>
                                </div>
                            </div>

                            <Accordion type="single" collapsible className="space-y-4">
                                {API_DOCS.map((doc, i) => (
                                    <AccordionItem 
                                        key={i} 
                                        value={`item-${i}`}
                                        className="group rounded-3xl border bg-card/50 px-5 py-2 hover:border-primary/40 transition-all shadow-sm ring-1 ring-border/50"
                                    >
                                        <div className="flex items-center justify-between py-2">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h5 className="text-[14px] font-bold tracking-tight">{doc.title}</h5>
                                                    {doc.tooltip && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <HelpCircle className="size-3.5 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                                                            </TooltipTrigger>
                                                            <TooltipContent 
                                                                side="top" 
                                                                className="max-w-[280px] bg-popover border-border shadow-xl rounded-xl p-4 animate-in zoom-in-95 duration-200"
                                                            >
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 border-b pb-2">
                                                                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                                                                        <p className="text-xs font-bold text-foreground">Auth Requirement</p>
                                                                    </div>
                                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                                        {doc.tooltip}
                                                                    </p>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground font-medium">{doc.desc}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 rounded-lg text-[10px] font-bold px-3 hover:bg-primary/5 hover:text-primary transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(doc.endpoint.split(' ')[1]);
                                                        toast.success("Endpoint copied");
                                                    }}
                                                >
                                                    <Copy className="size-3 mr-2" />
                                                    Copy URL
                                                </Button>
                                                <AccordionTrigger className="hover:no-underline p-0">
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 font-black h-7 text-[10px] px-3 uppercase rounded-lg">
                                                        {doc.endpoint.split(' ')[0]}
                                                    </Badge>
                                                </AccordionTrigger>
                                            </div>
                                        </div>

                                        <AccordionContent className="pt-4 pb-4 border-t border-border/30">
                                            <div className="space-y-4">
                                                <div className="bg-muted/40 rounded-2xl p-4 border border-muted/50 font-mono text-[11px] flex items-center justify-between">
                                                    <span className="text-muted-foreground font-medium">
                                                        {doc.endpoint.split(' ')[1]}
                                                    </span>
                                                </div>
                                                
                                                <div className="relative group">
                                                    <pre className="p-4 rounded-2xl bg-black/90 text-green-400 border font-mono text-[10px] overflow-x-auto leading-relaxed shadow-inner max-h-[300px] custom-scrollbar">
                                                        {JSON.stringify({ headers: doc.headers, payload: doc.payload }, null, 2)}
                                                    </pre>
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm" 
                                                        className="absolute top-2 right-2 h-7 rounded-lg text-[9px] font-bold shadow-lg border border-border"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(JSON.stringify({ headers: doc.headers, payload: doc.payload }, null, 2));
                                                            toast.success("Payload copied");
                                                        }}
                                                    >
                                                        <Copy className="size-3 mr-2" />
                                                        Copy JSON
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                                                    <Info className="size-3.5 text-primary shrink-0" />
                                                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                                        Replace placeholder values with your actual integration data. All endpoints require a valid Bearer token.
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    ) : sourceType === 'CSV' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <div className="relative p-1 rounded-3xl bg-muted/10 border-2 border-dashed border-border/60 group hover:border-primary/40 hover:bg-muted/20 transition-all">
                                <CsvUploader
                                    onUploadSuccess={onFileUploaded}
                                    onHeadersExtracted={setCsvHeaders}
                                    label="Drop campaign dataset here"
                                />
                                <div className="absolute top-4 right-4">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="p-1.5 rounded-full hover:bg-background shadow-sm transition-all text-muted-foreground hover:text-primary">
                                                <HelpCircle className="size-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent 
                                            side="left" 
                                            className="max-w-[280px] bg-popover border-border shadow-xl rounded-xl p-4 animate-in zoom-in-95 duration-200"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 border-b pb-2">
                                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                                    <p className="text-xs font-bold text-foreground">Pro-Tip: Auto-Mapping</p>
                                                </div>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Prefix your CSV columns with <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono font-bold">req_</code> to automatically link them to bot variables.
                                                </p>
                                                <div className="bg-muted/50 p-2 rounded-lg border border-border/50">
                                                    <p className="text-[10px] font-mono text-foreground/70">
                                                        req_name <span className="text-primary mx-1">→</span> {"{{session.name}}"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            
                            {filePath && (
                                <div className="space-y-4">
                                    <div className={cn(
                                        "px-4 py-3 rounded-xl border flex items-center justify-between animate-in zoom-in-95 duration-300",
                                        validation.valid ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20 shadow-sm"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {validation.valid ? (
                                                <div className="size-7 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="size-4 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="size-7 rounded-full bg-destructive/10 flex items-center justify-center">
                                                    <AlertCircle className="size-4 text-destructive" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className={cn("text-[13px] font-bold", validation.valid ? "text-green-700" : "text-destructive")}>
                                                    {validation.valid ? "Data Verified" : "Action Required"}
                                                </span>
                                                <p className="text-[10px] opacity-60 font-medium">
                                                    {validation.valid ? "Dataset schema matches bot requirements" : "Missing required columns in CSV"}
                                                </p>
                                            </div>
                                        </div>
                                        {validation.valid && <Badge variant="outline" className="h-5 text-[9px] bg-background border-green-200 text-green-700">STABLE</Badge>}
                                    </div>
                                    
                                    {!validation.valid && (
                                        <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10 flex gap-3 animate-in slide-in-from-top-2">
                                            <AlertCircle className="size-3.5 text-destructive shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-destructive/80 leading-relaxed font-medium">
                                                The following columns are missing: <span className="font-mono font-bold text-destructive underline decoration-dotted">{validation.missing.join(', ')}</span>.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
                            {/* Compact DB Selectors */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Infrastructure</Label>
                                    <Select value={selectedDataSourceId} onValueChange={onDataSourceChange}>
                                        <SelectTrigger className="h-11 bg-muted/20 border-transparent rounded-xl text-xs hover:bg-muted/40 transition-colors">
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
                                            <TooltipTrigger asChild>
                                                <button className="text-muted-foreground hover:text-primary transition-colors">
                                                    <HelpCircle className="size-3.5" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent 
                                                side="top" 
                                                className="max-w-[280px] bg-popover border-border shadow-xl rounded-xl p-4 animate-in zoom-in-95 duration-200"
                                            >
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 border-b pb-2">
                                                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                                                        <p className="text-xs font-bold text-foreground">Mapping Hint</p>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        Use <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono font-bold">AS</code> to map columns to the required names.
                                                    </p>
                                                    <div className="bg-muted/50 p-2 rounded-lg border border-border/50">
                                                        <p className="text-[10px] font-mono text-foreground/70">
                                                            SELECT mobile AS phone...
                                                        </p>
                                                    </div>
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Select value={selectedView} onValueChange={onViewChange} disabled={!selectedDataSourceId || loadingTables}>
                                        <SelectTrigger className="h-11 bg-muted/20 border-transparent rounded-xl text-xs hover:bg-muted/40 transition-colors">
                                            <SelectValue placeholder={loadingTables ? "Fetching schemas..." : "Select View"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tables.map((t: any) => (
                                                <SelectItem key={t.name} value={t.name} className="text-xs">
                                                    <span className="opacity-40 mr-2 font-mono">[{t.type[0]}]</span>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {selectedView && (
                                <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                    <div className={cn(
                                        "px-4 py-3 rounded-xl border flex items-center justify-between",
                                        validation.valid ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("size-7 rounded-full flex items-center justify-center", validation.valid ? "bg-green-500/10" : "bg-destructive/10")}>
                                                {validation.valid ? <CheckCircle2 className="size-4 text-green-500" /> : <AlertCircle className="size-4 text-destructive" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={cn("text-[13px] font-bold", validation.valid ? "text-green-700" : "text-destructive")}>
                                                    {validation.valid ? "Schema Handshake Ready" : "Structural Mismatch"}
                                                </span>
                                                <p className="text-[10px] opacity-60 font-medium">
                                                    {validation.valid ? "Database view perfectly aligned with bot" : "Please resolve missing columns below"}
                                                </p>
                                            </div>
                                        </div>
                                        {validation.valid && <Badge variant="outline" className="h-5 text-[9px] bg-background border-green-200 text-green-700">VERIFIED</Badge>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mapping Table */}
                    {sourceType !== 'API' && (sourceType === 'CSV' ? filePath : selectedView) && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="rounded-2xl border bg-card/50 overflow-hidden shadow-sm ring-1 ring-border/50">
                                <table className="w-full text-[12px]">
                                    <thead className="bg-muted/40 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left font-bold text-muted-foreground/80 uppercase tracking-wider text-[10px]">Requirement</th>
                                            <th className="px-6 py-3 text-left font-bold text-muted-foreground/80 uppercase tracking-wider text-[10px]">Source Connection</th>
                                            <th className="px-4 py-3 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {['phone', ...botVariables].map(v => {
                                            const matchedColumn = activeColumns.find((c: string) => {
                                                const lc = c.toLowerCase();
                                                const lv = v.toLowerCase();
                                                if (lc === lv) return true;
                                                if (lc === `req_${lv}`) return true;
                                                if (v === 'phone' && PHONE_ALIASES.includes(lc)) return true;
                                                return false;
                                            });
                                            return (
                                                <tr key={v} className="hover:bg-muted/20 transition-colors group">
                                                    <td className="px-6 py-3.5 font-mono font-bold text-foreground/90">{v}</td>
                                                    <td className="px-6 py-3.5">
                                                        {matchedColumn ? (
                                                            <span className="text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">{matchedColumn}</span>
                                                        ) : (
                                                            <span className="text-destructive/50 italic font-medium">Unmapped</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right">
                                                        {matchedColumn ? (
                                                            <div className="size-5 rounded-full bg-green-500/10 flex items-center justify-center ml-auto">
                                                                <CheckCircle2 className="size-3 text-green-500" />
                                                            </div>
                                                        ) : (
                                                            <div className="size-5 rounded-full bg-destructive/10 flex items-center justify-center ml-auto">
                                                                <AlertCircle className="size-3 text-destructive" />
                                                            </div>
                                                        )}
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
                    {sourceType !== 'API' && botVariables.length > 0 && (
                        <div className="p-5 rounded-2xl border bg-muted/5 border-border/50 animate-in fade-in duration-700">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Variable className="size-3.5 text-primary" />
                                </div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/80">Data Schema Requirements</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border/60 shadow-sm">
                                    <div className="size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                                    <span className="font-mono text-[10px] font-bold text-foreground">phone</span>
                                    <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded uppercase font-black">Core</span>
                                </div>
                                {botVariables.map(v => (
                                    <div key={v} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50 border border-border/40 transition-all hover:border-primary/30">
                                        <span className="font-mono text-[10px] font-bold text-foreground/80">{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
