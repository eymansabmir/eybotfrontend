import { SUPPORTED_LANGUAGES, COMMON_LANGUAGES, ISO_TO_NATIVE_NAME } from "@/features/i18n/languages";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Languages, 
  ChevronsUpDown, 
  Star,
  StarOff,
  Search
} from "lucide-react";
import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LocalizationSettings {
  isEnabled: boolean;
  languages: string[];
  defaultLanguage?: string;
}

interface Props {
  localization?: LocalizationSettings;
  onChange: (localization: LocalizationSettings) => void;
}

export function LocalizationForm({ localization, onChange }: Props) {
  const [open, setOpen] = useState(false);
  
  const isEnabled = localization?.isEnabled ?? false;
  const enabledLanguages = localization?.languages ?? [];
  const defaultLanguage = localization?.defaultLanguage || (enabledLanguages.length > 0 ? enabledLanguages[0] : undefined);

  const handleToggle = (checked: boolean) => {
    onChange({ 
        ...localization, 
        isEnabled: checked, 
        languages: enabledLanguages,
        defaultLanguage
    });
  };

  const addLanguage = (code: string) => {
    if (enabledLanguages.includes(code)) return;
    if (enabledLanguages.length >= 10) return;

    const newLanguages = [...enabledLanguages, code];
    onChange({
      ...localization,
      isEnabled,
      languages: newLanguages,
      defaultLanguage: defaultLanguage || code,
    });
    setOpen(false);
  };

  const removeLanguage = (code: string) => {
    const newLanguages = enabledLanguages.filter((l) => l !== code);
    let newDefault = defaultLanguage;
    
    if (defaultLanguage === code) {
        newDefault = newLanguages.length > 0 ? newLanguages[0] : undefined;
    }

    onChange({
      ...localization,
      isEnabled,
      languages: newLanguages,
      defaultLanguage: newDefault,
    });
  };

  const setDefaultLanguage = (code: string) => {
    onChange({
        ...localization,
        isEnabled,
        languages: enabledLanguages,
        defaultLanguage: code,
    });
  };

  const getLanguageName = (code: string) => {
    return Object.entries(SUPPORTED_LANGUAGES).find(([_, c]) => c === code)?.[0] || code;
  };

  return (
    <div className="space-y-8">
      {/* Enable Toggle Section */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-muted/30 border border-border/50 shadow-sm transition-all hover:bg-muted/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Languages size={16} />
            </div>
            <Label className="text-base font-semibold">Multi-language Support</Label>
          </div>
          <p className="text-xs text-muted-foreground max-w-[400px]">
            Enable multiple languages to allow your bot to communicate with a global audience.
          </p>
        </div>
        <Switch checked={isEnabled} onCheckedChange={handleToggle} />
      </div>

      {isEnabled && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Add Language Section */}
          <div className="space-y-3">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">
                Add New Language
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-11 px-4 rounded-xl border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Search size={16} />
                    <span>
                        {enabledLanguages.length >= 10 
                            ? "Limit reached (max 10 languages)" 
                            : "Search and add a language..."}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command className="rounded-xl border shadow-2xl">
                  <CommandInput placeholder="Type a language (e.g. Arabic, Hindi)..." className="h-11" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No language found.</CommandEmpty>
                    <CommandGroup heading="All Supported Languages">
                      {COMMON_LANGUAGES.map((lang) => {
                        const code = SUPPORTED_LANGUAGES[lang];
                        const isAdded = enabledLanguages.includes(code);
                        return (
                          <CommandItem
                            key={code}
                            value={lang}
                            onSelect={() => addLanguage(code)}
                            disabled={isAdded || enabledLanguages.length >= 10}
                            className="flex items-center justify-between py-2.5"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span>{lang}</span>
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">
                                {code}
                              </span>
                            </div>
                            {isAdded ? (
                                <Badge variant="secondary" className="text-[10px] h-5">Added</Badge>
                            ) : enabledLanguages.length >= 10 && (
                                <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">Limit Reached</Badge>
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Enabled Languages List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Enabled Languages ({enabledLanguages.length})
                </Label>
                {enabledLanguages.length > 0 && (
                    <span className="text-[10px] text-muted-foreground italic">
                        Click star to set as default
                    </span>
                )}
            </div>
            
            <div className="grid gap-3">
              {enabledLanguages.map((code) => {
                const isDefault = defaultLanguage === code;
                const langName = getLanguageName(code);
                const nativeName = ISO_TO_NATIVE_NAME[code];

                return (
                  <div 
                    key={code} 
                    className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all duration-200 group bg-card",
                        isDefault ? "border-primary/30 ring-1 ring-primary/10 shadow-sm" : "border-border/50 hover:border-border hover:shadow-xs"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                          "size-10 rounded-full flex items-center justify-center transition-colors",
                          isDefault ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                          <Languages size={18} />
                      </div>
                      <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{langName}</span>
                            {isDefault && (
                                <Badge variant="default" className="text-[9px] px-1.5 h-4 bg-primary/90">
                                    DEFAULT
                                </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {nativeName} • <span className="uppercase">{code}</span>
                          </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "size-8 rounded-lg",
                            isDefault ? "text-primary hover:bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                        )}
                        onClick={() => setDefaultLanguage(code)}
                        title={isDefault ? "Default language" : "Set as default"}
                      >
                        {isDefault ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeLanguage(code)}
                        title="Remove language"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}

              {enabledLanguages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed border-muted bg-muted/5 space-y-3">
                    <div className="p-3 rounded-full bg-muted/20">
                        <Languages className="text-muted-foreground opacity-30" size={32} />
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      No languages added yet. Add a language to get started.
                    </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
