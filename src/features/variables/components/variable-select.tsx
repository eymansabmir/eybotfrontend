import * as React from "react";
import { useVariablesStore } from "../store";
import { 
    Combobox, 
    ComboboxInput, 
    ComboboxContent, 
    ComboboxList, 
    ComboboxItem, 
} from "@/components/ui/combobox";
import { Variable as VarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariableSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    isSessionOnly?: boolean;
}

export function VariableSelect({ value, onValueChange, placeholder = "Select variable...", className, isSessionOnly }: VariableSelectProps) {
    const { variables, addVariable } = useVariablesStore();
    const [searchValue, setSearchValue] = React.useState("");

    const filteredVariables = variables.filter(v => 
        (!isSessionOnly || v.isSessionVariable) &&
        v.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleCreateNew = () => {
        if (!searchValue.trim()) return;
        const newVar = addVariable(searchValue.trim(), true);
        onValueChange(newVar.name);
        setSearchValue("");
    };

    return (
        <Combobox 
            value={value} 
            onValueChange={(val) => onValueChange(val || "")}
        >
            <ComboboxInput
                className={cn("h-8 text-xs", className)}
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
            />
            <ComboboxContent>
                <ComboboxList>
                    {filteredVariables.map((v) => (
                        <ComboboxItem key={v.id} value={v.name} className="text-xs">
                            <VarIcon size={12} className="mr-2 text-muted-foreground" />
                            {v.name}
                        </ComboboxItem>
                    ))}
                    
                    {searchValue.trim() && !variables.some(v => v.name === searchValue.trim()) && (
                        <button
                            onClick={handleCreateNew}
                            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors text-left font-medium text-[var(--ey-yellow)]"
                        >
                            <Plus size={12} />
                            Create "{searchValue}"
                        </button>
                    )}

                    {filteredVariables.length === 0 && !searchValue.trim() && (
                        <div className="px-2 py-4 text-center text-xs text-muted-foreground italic">
                            No variables defined yet
                        </div>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
