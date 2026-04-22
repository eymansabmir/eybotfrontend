import { Trash2, Database, Search, Target, Activity, Settings2, ChevronRight, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { ConditionLeaf, EntityAttribute } from "../../../types";
import { OPERATOR_LABELS } from "../../../types";
import { useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConditionRowProps {
  leaf: ConditionLeaf;
  attributes: EntityAttribute[] | Record<string, EntityAttribute[]>;
  depth?: number;
  onChange: (updated: ConditionLeaf) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function ValueSelector({ 
  values, 
  value, 
  onChange,
  placeholder = "Select or type value..."
}: { 
  values: string[], 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredValues = useMemo(() => {
    if (!search) return values;
    return values.filter(v => v.toLowerCase().includes(search.toLowerCase()));
  }, [values, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between h-9 text-xs bg-background font-mono"
        >
          {value || <span className="text-muted-foreground font-normal italic">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search values or type custom..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
               <div className="p-2 space-y-2">
                  <p className="text-xs text-muted-foreground">No matching values found</p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full h-8 text-[10px] font-bold gap-2"
                    onClick={() => {
                      if (!search) return;
                      onChange(search);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <Plus className="size-3" /> Use custom: {search}
                  </Button>
               </div>
            </CommandEmpty>
            <CommandGroup heading="Suggestions">
              {filteredValues.map((v) => (
                <CommandItem
                  key={v}
                  value={v}
                  onSelect={() => {
                    onChange(v);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-bold">{v}</span>
                    <Check
                      className={cn(
                        "ml-auto size-4",
                        value === v ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ConditionRow({
  leaf,
  attributes: groupedAttributes,
  depth = 0,
  onChange,
  onRemove,
  canRemove,
}: ConditionRowProps) {
  // Normalize attributes to a Record structure
  const attributesMap = useMemo(() => {
    if (Array.isArray(groupedAttributes)) {
      return { "Default": groupedAttributes };
    }
    return groupedAttributes;
  }, [groupedAttributes]);

  const entities = useMemo(() => Object.keys(attributesMap), [attributesMap]);
  
  // Internal state for the selection flow
  const initialEntity = useMemo(() => {
    if (!leaf.field) return entities[0] || null;
    const parts = leaf.field.split('.');
    return parts.length > 1 ? parts[0] : (entities[0] || null);
  }, [leaf.field, entities]);

  const [selectedEntity, setSelectedEntity] = useState<string | null>(initialEntity);
  const [entitySearch, setEntitySearch] = useState("");
  const [entityOpen, setEntityOpen] = useState(false);
  const [attrSearch, setAttrSearch] = useState("");
  const [attrOpen, setAttrOpen] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string | undefined>(
    !leaf.field ? "item-1" : undefined
  );

  // Sync internal entity when leaf changes externally
  useEffect(() => {
    if (leaf.field) {
      const parts = leaf.field.split('.');
      if (parts.length > 1) setSelectedEntity(parts[0]);
    }
  }, [leaf.field]);

  const currentAttributes = selectedEntity ? attributesMap[selectedEntity] || [] : [];
  
  const filteredAttributes = useMemo(() => {
    if (!attrSearch) return currentAttributes;
    return currentAttributes.filter(a => a.key.toLowerCase().includes(attrSearch.toLowerCase()));
  }, [currentAttributes, attrSearch]);

  const selectedAttrKey = useMemo(() => {
    if (!selectedEntity || !leaf.field) return "";
    if (leaf.field.startsWith(`${selectedEntity}.`)) {
      return leaf.field.slice(selectedEntity.length + 1);
    }
    return leaf.field;
  }, [leaf.field, selectedEntity]);

  const selectedAttr = currentAttributes.find(a => a.key === selectedAttrKey);

  const handleEntityChange = (entity: string) => {
    setSelectedEntity(entity);
    setEntityOpen(false);
    
    // Ensure accordion stays open
    setAccordionValue("item-1"); 

    // If entity changed, we reset the field to the first available attribute
    const firstAttr = attributesMap[entity]?.[0];
    if (firstAttr) {
      handleFieldChange(`${entity}.${firstAttr.key}`, firstAttr);
    } else {
      // If no attributes, set a placeholder so Step 2 shows up
      handleFieldChange(`${entity}.`, { key: "", type: "string", operators: ["equals", "not_equals"], values: null });
    }
  };

  const handleFieldChange = (fullKey: string, attr: EntityAttribute) => {
    onChange({
      ...leaf,
      field: fullKey,
      operator: attr.operators[0] ?? "equals",
      value: attr.type === "boolean" ? "true" : (leaf.value || ""),
    });
  };

  const handleOperatorChange = (op: string) => {
    onChange({ ...leaf, operator: op, value: "" });
  };

  const handleValueChange = (val: unknown) => {
    onChange({ ...leaf, value: val });
  };

  const operators = selectedAttr?.operators ?? ["equals", "not_equals"];
  const attrType = selectedAttr?.type ?? "string";

  // Build a summary string for the collapsed view
  const summary = useMemo(() => {
    if (!leaf.field) return "New Match Condition";
    const attrName = selectedAttr?.key || leaf.field;
    const opLabel = OPERATOR_LABELS[leaf.operator] || leaf.operator;
    return (
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="outline" className="h-4 px-1 text-[9px] font-mono bg-primary/5 uppercase">
          {selectedEntity}
        </Badge>
        <span className="font-bold text-foreground">{attrName}</span>
        <span className="text-muted-foreground italic px-0.5">{opLabel}</span>
        <span className="font-mono bg-muted/60 px-1.5 py-0.5 rounded text-primary font-bold">
          {String(leaf.value || "...")}
        </span>
      </div>
    );
  }, [leaf, selectedEntity, selectedAttr]);

  return (
    <div className="group relative">
      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary transition-colors rounded-full" />
      
      <Accordion 
        type="single" 
        collapsible 
        value={accordionValue}
        onValueChange={setAccordionValue}
        className={cn(
          "w-full border rounded-xl bg-background shadow-sm overflow-hidden transition-all duration-300",
          depth > 0 && "border-primary/10 shadow-none bg-background/50",
          accordionValue && "ring-1 ring-primary/20"
        )}
      >
        <AccordionItem value="item-1" className="border-none">
          <div className={cn(
            "flex items-center px-4 py-1 gap-2 transition-colors",
            accordionValue ? "bg-primary/5" : "bg-muted/20"
          )}>
            <div className="flex-1 min-w-0">
              <AccordionTrigger className="w-full py-3 hover:no-underline font-normal text-xs text-left">
                {summary}
              </AccordionTrigger>
            </div>
            
            <div className="flex items-center gap-1 shrink-0 px-2 relative z-50">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()} // Stop Radix from handling pointer
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                  toast.success("Condition removed");
                }}
                disabled={!canRemove}
                className="size-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-red-500/15 hover:text-red-500 transition-all active:scale-95 disabled:opacity-10 disabled:cursor-not-allowed border border-transparent hover:border-red-500/20"
                title={!canRemove ? "At least one condition is required" : "Remove condition"}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          <AccordionContent className="px-5 pb-5 pt-3 grid grid-cols-1 md:grid-cols-2 gap-6 ring-1 ring-border/50 bg-muted/5">
            {/* Step 1: Search Entity */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">1</div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Context / Entity</label>
              </div>
              
              <Popover open={entityOpen} onOpenChange={setEntityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={entityOpen}
                    className="w-full justify-between h-9 text-xs font-semibold bg-background"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {selectedEntity ? (
                        <>
                          <Database className="size-3.5 text-primary" />
                          <span className="truncate">{selectedEntity}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground font-normal italic">Search for a dataset...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Type a dataset name..." 
                      value={entitySearch}
                      onValueChange={setEntitySearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <p className="py-6 text-xs text-muted-foreground font-medium">No datasets found matching "{entitySearch}"</p>
                      </CommandEmpty>
                      <CommandGroup heading="Available Datasets">
                        {entities.map((entity) => (
                          <CommandItem
                            key={entity}
                            value={entity}
                            onSelect={() => handleEntityChange(entity)}
                            className="text-xs cursor-pointer"
                          >
                            <Database className="mr-2 size-3.5 opacity-50" />
                            <div className="flex flex-col">
                              <span className="font-bold">{entity}</span>
                              <span className="text-[9px] text-muted-foreground">
                                {attributesMap[entity]?.length || 0} attributes available
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto size-4",
                                selectedEntity === entity ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </motion.div>

            {/* Step 2: Select Property */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={selectedEntity ? { opacity: 1, x: 0 } : { opacity: 0.3, x: 20 }}
              className={cn("space-y-3 transition-opacity", !selectedEntity && "pointer-events-none")}
            >
              <div className="flex items-center gap-2">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">2</div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pick Property / Attribute</label>
              </div>

              <Popover open={attrOpen} onOpenChange={setAttrOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-9 text-xs font-semibold bg-background"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {selectedAttrKey ? (
                        <>
                          <Target className="size-3.5 text-primary" />
                          <span className="truncate">{selectedAttrKey}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground font-normal italic">Search or enter custom...</span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search attributes or type custom..." 
                      value={attrSearch}
                      onValueChange={setAttrSearch}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <div className="p-2 space-y-2">
                           <p className="text-xs text-muted-foreground">No existing attributes match "{attrSearch}"</p>
                           <Button 
                              variant="secondary" 
                              size="sm" 
                              className="w-full h-8 text-[10px] font-bold gap-2"
                              onClick={() => {
                                if (!attrSearch) return;
                                handleFieldChange(`${selectedEntity}.${attrSearch}`, {
                                  key: attrSearch,
                                  type: "string",
                                  operators: ["equals", "not_equals", "contains", "in", "not_in"],
                                  values: null
                                });
                                setAttrOpen(false);
                                setAttrSearch("");
                              }}
                           >
                              <Plus className="size-3" /> Create custom: {attrSearch}
                           </Button>
                        </div>
                      </CommandEmpty>
                      <CommandGroup heading="Known Attributes">
                        {filteredAttributes.map((attr) => (
                          <CommandItem
                            key={attr.key}
                            value={attr.key}
                            onSelect={() => {
                              handleFieldChange(`${selectedEntity}.${attr.key}`, attr);
                              setAttrOpen(false);
                              setAttrSearch("");
                            }}
                            className="text-xs cursor-pointer"
                          >
                            <Target className="mr-2 size-3.5 opacity-50" />
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-bold">{attr.key}</span>
                              <span className="text-[9px] uppercase font-mono text-muted-foreground border px-1 rounded bg-muted/40 ml-auto">{attr.type}</span>
                            </div>
                            <Check
                              className={cn(
                                "ml-2 size-4",
                                selectedAttrKey === attr.key ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </motion.div>

            {/* Step 3: Logic & Values */}
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={leaf.field ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
              className={cn("col-span-full space-y-4 pt-4 border-t border-dashed overflow-hidden")}
            >
               <div className="flex items-center gap-2 mb-1">
                <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 text-[10px] font-bold">3</div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Define Match Logic</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-muted-foreground pl-1">Operator</label>
                  <Select
                    value={leaf.operator}
                    onValueChange={handleOperatorChange}
                  >
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op} value={op} className="text-xs">
                          {OPERATOR_LABELS[op] ?? op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-muted-foreground pl-1">Target Value</label>
                  {attrType === "boolean" ? (
                    <Select
                      value={String(leaf.value)}
                      onValueChange={handleValueChange}
                    >
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : selectedAttr?.values?.length ? (
                    <ValueSelector 
                      values={selectedAttr.values} 
                      value={String(leaf.value || "")} 
                      onChange={handleValueChange}
                      placeholder={["in", "not_in"].includes(leaf.operator) ? "Search or add values..." : "Select or type value..."}
                    />
                  ) : (
                    <Input
                      type={attrType === "number" ? "number" : attrType === "date" ? "date" : "text"}
                      className="h-9 text-xs bg-background font-mono"
                      placeholder={["in", "not_in"].includes(leaf.operator) ? "val1, val2..." : "e.g. Gold Tier"}
                      value={String(leaf.value ?? "")}
                      onChange={(e) => handleValueChange(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
