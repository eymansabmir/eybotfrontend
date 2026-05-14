import { useEffect, useMemo, useRef } from "react";
import { Info, AlertCircle, Loader2 } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useBot } from "@/features/bots/data/queries/use-bots";

interface VariableMappingStepProps {
    botId: string;
    headers: string[];
    mapping: Record<string, string>;
    onMappingChange: (mapping: Record<string, string>) => void;
}

export function VariableMappingStep({
    botId,
    headers,
    mapping,
    onMappingChange,
}: VariableMappingStepProps) {
    const { data: bot, isLoading } = useBot(botId);

    // 1. Extract variables from bot nodes
    const botVariables = useMemo(() => {
        if (!bot?.nodes) return [];
        
        const vars = new Set<string>();
        const nodes = bot.nodes as any[];
        
        // Recursive search for {{var}} patterns in bot JSON
        const findVars = (obj: any) => {
            if (typeof obj === "string") {
                const matches = obj.matchAll(/\{\{session\.([^}]+)\}\}/g);
                for (const match of matches) {
                    vars.add(match[1]);
                }
            } else if (obj && typeof obj === "object") {
                Object.values(obj).forEach(findVars);
            }
        };

        findVars(nodes);
        return Array.from(vars);
    }, [bot]);

    // 2. Auto-map headers on first load
    const hasAutoMappedRef = useRef(false);
    useEffect(() => {
        if (headers.length > 0 && Object.keys(mapping).length === 0 && !hasAutoMappedRef.current) {
            const newMapping: Record<string, string> = {};
            
            // Auto-detect phone number
            const phoneHeader = headers.find(h => 
                ['phone', 'waid', 'contact', 'mobile', 'phonenumber'].includes(h.toLowerCase().trim())
            );
            if (phoneHeader) newMapping["waId"] = phoneHeader;

            // Auto-map matching names
            botVariables.forEach(v => {
                const match = headers.find(h => h.toLowerCase().trim() === v.toLowerCase().trim());
                if (match) newMapping[v] = match;
            });

            hasAutoMappedRef.current = true;
            onMappingChange(newMapping);
        }
    }, [headers, botVariables, mapping, onMappingChange]);

    const handleMap = (botVar: string, csvCol: string) => {
        onMappingChange({
            ...mapping,
            [botVar]: csvCol === "none" ? "" : csvCol,
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                <Loader2 className="animate-spin text-primary" size={24} />
                <p className="text-sm">Loading bot variables...</p>
            </div>
        );
    }

    if (headers.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-40 gap-3 border-2 border-dashed rounded-xl border-border bg-muted/20">
                <AlertCircle className="text-amber-500" size={24} />
                <p className="text-sm font-medium">No headers found in the uploaded file</p>
                <p className="text-xs text-muted-foreground text-center px-6">
                    Please go back and upload a valid CSV or Excel file with a header row.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-foreground">Variable Mapping</h3>
                <p className="text-sm text-muted-foreground">
                    Link your CSV columns to the variables used in your bot.
                </p>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-1/2">Bot Variable</TableHead>
                            <TableHead className="w-1/2">CSV Column</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* Always show Phone Number mapping */}
                        <TableRow>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>Phone Number</span>
                                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Required</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Select 
                                    value={mapping["waId"] || "none"} 
                                    onValueChange={(val) => handleMap("waId", val)}
                                >
                                    <SelectTrigger className={!mapping["waId"] ? "border-red-500/50" : ""}>
                                        <SelectValue placeholder="Select column..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Skip)</SelectItem>
                                        {headers.map(h => (
                                            <SelectItem key={h} value={h}>{h}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>

                        {/* Dynamic Variables from Bot */}
                        {botVariables.map(v => (
                            <TableRow key={v}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                                            {"{{" + v + "}}"}
                                        </code>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Select 
                                        value={mapping[v] || "none"} 
                                        onValueChange={(val) => handleMap(v, val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Skip variable" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Skip --</SelectItem>
                                            {headers.map(h => (
                                                <SelectItem key={h} value={h}>{h}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}

                        {botVariables.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground italic">
                                    No dynamic variables found in this bot.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Validation & Info */}
            <div className="space-y-3">
                {!mapping["waId"] && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                        <AlertCircle className="size-4 mt-0.5 shrink-0" />
                        <p>Please map a CSV column to the Phone Number field to continue.</p>
                    </div>
                )}
                
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 text-sm font-medium">
                    <Info className="size-4 mt-0.5 shrink-0" />
                    <p>Variables are used to personalize messages, like <code className="text-[10px] bg-blue-500/20 px-1 rounded">{"{{session.name}}"}</code>.</p>
                </div>
            </div>
        </div>
    );
}
