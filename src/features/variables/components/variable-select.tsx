import * as React from "react";
import { useVariablesStore } from "../store";
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
} from "@/components/ui/combobox";
import { Variable as VarIcon, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariableSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    isSessionOnly?: boolean;
}

/**
 * Searchable variable picker with create-on-the-fly support.
 *
 * Two visual states:
 * 1. **Empty** — shows a combobox input for searching and selecting variables.
 * 2. **Selected** — shows a styled pill with the variable name + clear button.
 *
 * This ensures the user always knows which variable is currently assigned.
 */
export function VariableSelect({
    value,
    onValueChange,
    placeholder = "Select variable...",
    className,
    isSessionOnly,
}: VariableSelectProps) {
    const { variables, addVariable } = useVariablesStore();
    const [searchValue, setSearchValue] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);

    const filteredVariables = variables.filter(
        (v) =>
            (!isSessionOnly || v.isSessionVariable) &&
            v.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleSelect = (val: string | null) => {
        onValueChange(val || "");
        setSearchValue("");
        setIsOpen(false);
    };

    const handleCreateNew = () => {
        if (!searchValue.trim()) return;
        const newVar = addVariable(searchValue.trim(), true);
        onValueChange(newVar.name);
        setSearchValue("");
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onValueChange("");
        setSearchValue("");
    };

    // ── Selected state: show pill ─────────────────────────────────────
    if (value && !isOpen) {
        return (
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className={cn(
                    "flex items-center gap-1.5 h-8 w-full rounded-lg border border-[var(--ey-yellow)]/30 bg-[var(--ey-yellow)]/5 px-2.5 text-xs font-medium text-foreground transition-all hover:border-[var(--ey-yellow)]/50 hover:bg-[var(--ey-yellow)]/10 cursor-pointer group",
                    className
                )}
            >
                <VarIcon
                    size={12}
                    className="shrink-0 text-[var(--ey-yellow)]"
                />
                <span className="truncate flex-1 text-left">{value}</span>
                <span
                    role="button"
                    tabIndex={0}
                    onClick={handleClear}
                    onKeyDown={(e) => e.key === "Enter" && handleClear(e as any)}
                    className="shrink-0 rounded-sm p-0.5 text-muted-foreground opacity-60 hover:opacity-100 hover:bg-muted transition-all"
                    aria-label="Clear variable"
                >
                    <X size={10} />
                </span>
            </button>
        );
    }

    // ── Empty / search state: show combobox ────────────────────────────
    return (
        <Combobox
            value={value || null}
            onValueChange={handleSelect}
            open={isOpen || undefined}
            onOpenChange={setIsOpen}
        >
            <ComboboxInput
                className={cn("h-8 text-xs", className)}
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                autoFocus={isOpen}
            />
            <ComboboxContent>
                <ComboboxList>
                    {filteredVariables.map((v) => (
                        <ComboboxItem
                            key={v.id}
                            value={v.name}
                            className="text-xs"
                        >
                            <VarIcon
                                size={12}
                                className="mr-2 text-muted-foreground"
                            />
                            {v.name}
                        </ComboboxItem>
                    ))}

                    {searchValue.trim() &&
                        !variables.some(
                            (v) => v.name === searchValue.trim()
                        ) && (
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
                            No variables defined yet. Type to create one.
                        </div>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}
