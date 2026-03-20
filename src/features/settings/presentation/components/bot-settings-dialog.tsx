import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalizationForm } from "./localization-form";
import { Settings, Languages, MessageSquare } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: any;
  onSave: (updates: any) => void;
}

export function BotSettingsDialog({ open, onOpenChange, bot, onSave }: Props) {
  const handleLocalizationChange = (localization: any) => {
    onSave({
      settings: {
        ...bot.settings,
        localization,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
        <Tabs defaultValue="localization" className="w-full h-full">
          <div className="flex h-[500px]">
            {/* Sidebar */}
            <div className="w-1/3 bg-muted/30 border-r p-4 space-y-4">
              <div className="px-2 py-4">
                  <h2 className="text-lg font-bold tracking-tight">Bot Settings</h2>
                  <p className="text-[11px] text-muted-foreground italic">Configure your bot behavior</p>
              </div>
              <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 w-full translate-x-0">
                 <TabsTrigger 
                  value="general" 
                  className="w-full justify-start gap-3 px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                 >
                   <Settings size={14} />
                   General
                 </TabsTrigger>
                 <TabsTrigger 
                  value="localization" 
                  className="w-full justify-start gap-3 px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                 >
                   <Languages size={14} />
                   Localization
                 </TabsTrigger>
                 <TabsTrigger 
                  value="timeout" 
                  className="w-full justify-start gap-3 px-3 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
                 >
                   <MessageSquare size={14} />
                   Fallback
                 </TabsTrigger>
              </TabsList>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-background">
              <TabsContent value="general" className="mt-0 space-y-4">
                <div className="space-y-1">
                   <h3 className="text-sm font-semibold">General Settings</h3>
                   <p className="text-[11px] text-muted-foreground">Basic bot configuration</p>
                </div>
                <div className="p-4 rounded-xl border border-dashed text-xs text-muted-foreground text-center">
                    General settings coming soon...
                </div>
              </TabsContent>

              <TabsContent value="localization" className="mt-0 space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1 mb-6">
                   <h3 className="text-sm font-semibold">Localization Settings</h3>
                   <p className="text-[11px] text-muted-foreground">Manage bot languages and translations</p>
                </div>
                <LocalizationForm 
                  localization={bot.settings?.localization} 
                  onChange={handleLocalizationChange}
                />
              </TabsContent>

              <TabsContent value="timeout" className="mt-0">
                 <div className="space-y-1 mb-6">
                   <h3 className="text-sm font-semibold">Fallback Message</h3>
                   <p className="text-[11px] text-muted-foreground">Configure default responses</p>
                </div>
                {/* Fallback settings could go here */}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
