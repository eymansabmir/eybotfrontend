import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useVariablesStore } from "../store";

interface VariablesComboboxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function VariablesCombobox({ value, onChange, placeholder = "Select variable...", className }: VariablesComboboxProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const { variables, addVariable } = useVariablesStore();

    const handleSelect = (currentValue: string) => {
        // cmdk passes value in lower case but we want the actual case from store, or the trimmed raw value.
        // wait! If it's a creation item, we should handle it carefully.
        const actualVar = variables.find(v => v.name.toLowerCase() === currentValue.toLowerCase());
        if (actualVar) {
            onChange(actualVar.name);
        } else {
            onChange(currentValue);
        }
        setOpen(false);
    };

    const handleCreate = () => {
        const trimmed = inputValue.trim();
        if (trimmed) {
            if (!variables.some(v => v.name === trimmed)) {
                addVariable(trimmed);
            }
            onChange(trimmed);
            setOpen(false);
            setInputValue("");
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between overflow-hidden bg-primary/5 border-primary/20 hover:bg-primary/10 text-ey-yellow-text font-medium text-xs", className)}
                >
                    <div className="flex items-center gap-1.5 truncate">
                        <span className="text-[10px] font-bold text-ey-yellow-text/40">@</span>
                        <span className="truncate">
                            {value ? <span className="text-foreground">{value}</span> : <span className="text-muted-foreground/60">{placeholder}</span>}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-ey-yellow-text" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    <CommandInput 
                        placeholder="Search or create..." 
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {inputValue.trim() ? (
                                <button
                                    onClick={handleCreate}
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors text-left"
                                >
                                    <Plus size={14} className="shrink-0" />
                                    <span className="truncate">Create "{inputValue.trim()}"</span>
                                </button>
                            ) : (
                                "No variables found."
                            )}
                        </CommandEmpty>
                        <CommandGroup>
                            {variables.map((variable) => (
                                <CommandItem
                                    key={variable.id}
                                    value={variable.name}
                                    onSelect={handleSelect}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === variable.name ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {variable.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {inputValue.trim() && !variables.some(v => v.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
                            <div className="p-1 border-t">
                                <button
                                    onClick={handleCreate}
                                    className="flex w-full items-center gap-2 px-2 py-1.5 text-sm bg-primary/10 text-ey-yellow-text hover:bg-primary/20 rounded-sm transition-colors text-left font-medium"
                                >
                                    <Plus size={14} className="shrink-0" />
                                    <span className="truncate">Create "{inputValue.trim()}"</span>
                                </button>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
