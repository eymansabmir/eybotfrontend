import { Plus, Trash2, MapPin, Type, Image as ImageIcon, Video, FileText, Calendar, DollarSign } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TemplateNodeData, TemplateComponent, TemplateParameter } from "../schema";

interface TemplateConfigFormProps {
    data: TemplateNodeData;
    onChange: (patch: Partial<TemplateNodeData>) => void;
}

const SECTION_LABEL_CLASS = "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1";

const PARAM_TYPES = [
    { label: "Text", value: "text", icon: Type },
    { label: "Image", value: "image", icon: ImageIcon },
    { label: "Video", value: "video", icon: Video },
    { label: "Document", value: "document", icon: FileText },
    { label: "Location", value: "location", icon: MapPin },
    { label: "Date/Time", value: "date_time", icon: Calendar },
    { label: "Currency", value: "currency", icon: DollarSign },
];

export function TemplateConfigForm({ data, onChange }: TemplateConfigFormProps) {
    const components = data.components || [];

    const updateComponents = (newComponents: TemplateComponent[]) => {
        onChange({ components: newComponents });
    };

    const addComponent = (type: "header" | "body" | "button") => {
        if (type === "header" && components.some(c => c.type === "header")) return;
        if (type === "body" && components.some(c => c.type === "body")) return;

        const newComp: TemplateComponent = type === "button" 
            ? { type: "button", sub_type: "quick_reply", index: components.filter(c => c.type === "button").length, parameters: [] }
            : { type: type as "header" | "body", parameters: [] };
        
        updateComponents([...components, newComp]);
    };

    const removeComponent = (index: number) => {
        updateComponents(components.filter((_, i) => i !== index));
    };

    const updateComponent = (index: number, patch: Partial<TemplateComponent>) => {
        const newComponents = [...components];
        newComponents[index] = { ...newComponents[index], ...patch } as TemplateComponent;
        updateComponents(newComponents);
    };

    const addParameter = (compIndex: number) => {
        const newComponents = [...components];
        const comp = newComponents[compIndex];
        
        if (comp.type === "button") {
            (comp.parameters as any).push({ type: "text", text: "" });
        } else {
            const newParam: TemplateParameter = { type: "text", text: "" } as any;
            comp.parameters = [...(comp.parameters || []), newParam] as any;
        }
        updateComponents(newComponents);
    };

    const updateParameter = (compIndex: number, paramIndex: number, patch: any) => {
        const newComponents = [...components];
        const comp = newComponents[compIndex];
        if (comp.parameters) {
            comp.parameters[paramIndex] = { ...comp.parameters[paramIndex], ...patch };
        }
        updateComponents(newComponents);
    };

    const removeParameter = (compIndex: number, paramIndex: number) => {
        const newComponents = [...components];
        const comp = newComponents[compIndex];
        if (comp.parameters) {
            comp.parameters = comp.parameters.filter((_, i) => i !== paramIndex) as any;
        }
        updateComponents(newComponents);
    };

    return (
        <div className="flex flex-col gap-6 pt-1">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className={SECTION_LABEL_CLASS}>Template Name</Label>
                    <Input 
                        value={data.templateName} 
                        onChange={(e) => onChange({ templateName: e.target.value })} 
                        placeholder="hello_world" 
                        className="h-9 text-sm"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className={SECTION_LABEL_CLASS}>Language Code</Label>
                    <Input 
                        value={data.languageCode} 
                        onChange={(e) => onChange({ languageCode: e.target.value })} 
                        placeholder="en_US" 
                        className="h-9 text-sm"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className={SECTION_LABEL_CLASS}>Components</Label>
                    <div className="flex gap-2">
                        {!components.some(c => c.type === "header") && (
                            <Button variant="outline" size="xs" className="h-6 text-[9px] px-2" onClick={() => addComponent("header")}>
                                + Header
                            </Button>
                        )}
                        {!components.some(c => c.type === "body") && (
                            <Button variant="outline" size="xs" className="h-6 text-[9px] px-2" onClick={() => addComponent("body")}>
                                + Body
                            </Button>
                        )}
                        <Button variant="outline" size="xs" className="h-6 text-[9px] px-2" onClick={() => addComponent("button")}>
                            + Button
                        </Button>
                    </div>
                </div>

                <Accordion type="multiple" className="w-full space-y-2">
                    {components.map((comp, compIdx) => (
                        <AccordionItem key={compIdx} value={`comp-${compIdx}`} className="border rounded-lg bg-card px-3">
                            <AccordionTrigger className="py-2.5 text-xs hover:no-underline font-semibold capitalize">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                                        comp.type === "header" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                                        comp.type === "body" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" :
                                        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                                    )}>
                                        {comp.type}
                                    </span>
                                    {comp.type === "button" ? `${comp.sub_type} (Index: ${comp.index})` : comp.type}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-3 space-y-4">
                                <div className="flex flex-col gap-3 pt-2">
                                    {comp.type === "button" && (
                                        <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Type</Label>
                                                <Select value={comp.sub_type} onValueChange={(val: any) => updateComponent(compIdx, { sub_type: val })}>
                                                    <SelectTrigger className="h-8 text-[10px]"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="quick_reply">Quick Reply</SelectItem>
                                                        <SelectItem value="url">URL Button</SelectItem>
                                                        <SelectItem value="button">Other Button</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] uppercase font-bold text-muted-foreground">Index</Label>
                                                <Input 
                                                    type="number" 
                                                    value={comp.index} 
                                                    onChange={(e) => updateComponent(compIdx, { index: parseInt(e.target.value) || 0 })} 
                                                    className="h-8 text-[10px]" 
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Parameters</Label>
                                            <Button variant="ghost" size="xs" className="h-5 text-[9px] px-1 text-primary" onClick={() => addParameter(compIdx)}>
                                                <Plus className="size-2.5 mr-1" /> Add Param
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {(comp.parameters as any[])?.map((param, paramIdx) => (
                                                <div key={paramIdx} className="space-y-2 p-2 border rounded-md bg-muted/20 relative group/param">
                                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover/param:opacity-100 transition-opacity" onClick={() => removeParameter(compIdx, paramIdx)}>
                                                        <Trash2 className="size-3 text-destructive" />
                                                    </Button>
                                                    
                                                    <div className="flex items-center gap-2 pr-6">
                                                        <div className="w-24">
                                                            <Select value={param.type} onValueChange={(val: any) => updateParameter(compIdx, paramIdx, { type: val })}>
                                                                <SelectTrigger className="h-7 text-[10px]"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    {comp.type === "button" ? (
                                                                        <>
                                                                            <SelectItem value="payload">Payload</SelectItem>
                                                                            <SelectItem value="text">Text</SelectItem>
                                                                            <SelectItem value="coupon_code">Coupon Code</SelectItem>
                                                                        </>
                                                                    ) : (
                                                                        PARAM_TYPES.map(t => (
                                                                            <SelectItem key={t.value} value={t.value} className="text-[10px]">
                                                                                <div className="flex items-center gap-2">
                                                                                    <t.icon className="size-3" /> {t.label}
                                                                                </div>
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="flex-1">
                                                            {param.type === "text" && (
                                                                <Input 
                                                                    placeholder="Value..." 
                                                                    value={(param as any).text || ""} 
                                                                    onChange={(e) => updateParameter(compIdx, paramIdx, { text: e.target.value })} 
                                                                    className="h-7 text-[10px]" 
                                                                />
                                                            )}
                                                            {["image", "video", "document"].includes(param.type) && (
                                                                <Input 
                                                                    placeholder="URL or Variable..." 
                                                                    value={(param as any)[param.type]?.link || ""} 
                                                                    onChange={(e) => updateParameter(compIdx, paramIdx, { [param.type]: { link: e.target.value } })} 
                                                                    className="h-7 text-[10px]" 
                                                                />
                                                            )}
                                                            {param.type === "payload" && (
                                                                <Input 
                                                                    placeholder="Payload..." 
                                                                    value={(param as any).payload || ""} 
                                                                    onChange={(e) => updateParameter(compIdx, paramIdx, { payload: e.target.value })} 
                                                                    className="h-7 text-[10px]" 
                                                                />
                                                            )}
                                                            {/* Add more specialized inputs for location, currency, etc. as needed */}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!comp.parameters || comp.parameters.length === 0) && (
                                                <p className="text-center py-2 text-[9px] text-muted-foreground italic border border-dashed rounded-md">
                                                    No parameters added
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Button variant="ghost" size="xs" className="self-end text-[9px] text-destructive hover:bg-destructive/10" onClick={() => removeComponent(compIdx)}>
                                        <Trash2 className="size-3 mr-1" /> Remove {comp.type}
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                    {components.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10">
                            <p className="text-xs text-muted-foreground">No components configured</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Add Header, Body or Buttons to start</p>
                        </div>
                    )}
                </Accordion>
            </div>
        </div>
    );
}
