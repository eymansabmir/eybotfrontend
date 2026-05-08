import { useState } from "react";
import { Braces, Plus, Trash2, Search, Edit2, Check } from "lucide-react";
import { useVariablesStore } from "../store";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VariablesDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete?: (name: string) => void;
}

export function VariablesDrawer({ open, onOpenChange, onDelete }: VariablesDrawerProps) {
    const { variables, addVariable, updateVariable, removeVariable } = useVariablesStore();
    const [searchValue, setSearchValue] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const filteredVariables = variables.filter((v) =>
        v.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    const handleAdd = () => {
        const trimmed = searchValue.trim();
        if (!trimmed) return;
        
        if (variables.some(v => v.name.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Variable already exists");
            return;
        }

        addVariable(trimmed);
        setSearchValue("");
        toast.success(`Variable "${trimmed}" created`);
    };

    const handleStartEdit = (id: string, name: string) => {
        setEditingId(id);
        setEditValue(name);
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const trimmed = editValue.trim();
        if (!trimmed) return;

        if (variables.some(v => v.id !== editingId && v.name.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Variable name already exists");
            return;
        }

        updateVariable(editingId, { name: trimmed });
        setEditingId(null);
        toast.success("Variable renamed");
    };

    const handleDelete = (id: string, name: string) => {
        removeVariable(id);
        onDelete?.(name);
        toast.success(`Variable "${name}" deleted`);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md border-l shadow-2xl">
                <SheetHeader className="px-6 py-6 border-b bg-muted/5">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Braces className="size-5" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold tracking-tight">Variables</SheetTitle>
                            <SheetDescription className="text-xs mt-1">
                                Manage your global bot variables
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 flex flex-col min-h-0 bg-background">
                    <div className="p-6 border-b space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search or create variable..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                className="pl-10 h-11 rounded-xl bg-muted/20 border-border/40 focus-visible:ring-primary/20"
                            />
                            {searchValue.trim() && !variables.some(v => v.name.toLowerCase() === searchValue.toLowerCase()) && (
                                <Button
                                    size="sm"
                                    className="absolute right-1.5 top-1.5 h-8 rounded-lg gap-1.5 px-3 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={handleAdd}
                                >
                                    <Plus className="size-3.5" />
                                    <span>Create</span>
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Global List ({variables.length})
                            </span>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-2">
                            {filteredVariables.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                    <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                                        <Braces className="size-8 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-muted-foreground">No variables found</h3>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        {searchValue ? "Try a different search term" : "Create your first variable above"}
                                    </p>
                                </div>
                            ) : (
                                filteredVariables.map((variable) => (
                                    <div
                                        key={variable.id}
                                        className="group flex items-center justify-between p-3.5 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/10 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted/20 text-ey-yellow-text font-bold text-xs shrink-0 ring-1 ring-inset ring-border/10">
                                                @
                                            </div>
                                            
                                            {editingId === variable.id ? (
                                                <div className="flex items-center gap-1.5 flex-1 pr-2">
                                                    <Input
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSaveEdit();
                                                            if (e.key === "Escape") setEditingId(null);
                                                        }}
                                                        className="h-8 text-sm font-medium py-0 px-2 rounded-lg focus-visible:ring-primary/20"
                                                    />
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="size-8 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" 
                                                        onClick={handleSaveEdit}
                                                    >
                                                        <Check className="size-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-semibold truncate text-foreground/80 group-hover:text-foreground">
                                                    {variable.name}
                                                </span>
                                            )}
                                        </div>

                                        {editingId !== variable.id && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    onClick={() => handleStartEdit(variable.id, variable.name)}
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                    onClick={() => handleDelete(variable.id, variable.name)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <div className="p-6 border-t bg-muted/5 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-medium">
                        Changes are saved automatically
                    </p>
                    <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
