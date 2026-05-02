import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  LayoutGrid,
  Upload,
  ChevronRight,
  Search,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Download,
  FileJson
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ChatbotTemplate } from "../../data/templates-data";
import { useNavigate } from "@tanstack/react-router";
import { useCreateBot, useImportBot } from "../../data/queries/use-bots";
import { useTemplates } from "../../data/queries/use-templates";
import { templatesApi } from "../../data/api/templates-api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CreateBotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "main" | "templates";

export function CreateBotDialog({ open, onOpenChange }: CreateBotDialogProps) {
  const [step, setStep] = useState<Step>("main");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | "import">("import");
  const [customTemplates, setCustomTemplates] = useState<(ChatbotTemplate & { rawData: any })[]>([]);
  
  const navigate = useNavigate();
  const createBotMutation = useCreateBot();
  const importBotMutation = useImportBot();
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTemplates = [...customTemplates, ...(templates || [])];

  useEffect(() => {
    if (step === "templates" && selectedTemplateId !== "import" && allTemplates.length > 0) {
        const exists = allTemplates.find((t: ChatbotTemplate) => t.id === selectedTemplateId);
        if (!exists) {
            setSelectedTemplateId(allTemplates[0].id);
        }
    }
  }, [templates, customTemplates, selectedTemplateId, step]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsCreating(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        // Treat imported JSON as a custom template
        const newTemplateId = `imported-${Date.now()}`;
        const newTemplate = {
          id: newTemplateId,
          name: data.name || file.name.replace('.json', ''),
          description: "Custom flow imported from a JSON file.",
          emoji: "📦",
          category: "other" as const,
          fileName: file.name,
          rawData: data
        };

        setCustomTemplates(prev => [newTemplate, ...prev]);
        setSelectedTemplateId(newTemplateId);
        toast.success("Template parsed! Click 'Use this template' to create your bot.");
      } catch (error) {
        console.error(error);
        toast.error("Invalid JSON file format.");
      } finally {
        setIsCreating(false);
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset for same file re-upload
  };

  const handleStartFromScratch = () => {
    onOpenChange(false);
    navigate({ to: "/bot/$id", params: { id: "new" } });
  };

  const handleUseTemplate = async (template: ChatbotTemplate) => {
    setIsCreating(true);
    try {
      let newBot;

      if (template.id.startsWith("imported-")) {
        // It's a custom imported template from JSON
        const customTpl = customTemplates.find(t => t.id === template.id);
        if (!customTpl) throw new Error("Custom template data not found");
        
        newBot = await importBotMutation.mutateAsync(customTpl.rawData);
      } else {
        // Fetch the static template JSON from backend/mock
        const templateData = await templatesApi.getTemplateById(template.id);
        const payload = {
          name: template.name,
          orgId: "68b08633907a113536238290", // Standard orgId from project
          nodes: templateData.nodes,
          edges: templateData.edges,
          triggerType: "inbound",
          triggerConfig: { keywords: [] },
          status: "draft",
          settings: {
            timeoutSeconds: 300,
            maxSteps: 100,
            variables: []
          },
        };
        newBot = await createBotMutation.mutateAsync(payload as any);
      }

      toast.success(`Bot created from ${template.name} template!`);
      onOpenChange(false);
      navigate({ to: "/bot/$id", params: { id: newBot.id } });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create bot from template.");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTemplates = allTemplates.filter((t: ChatbotTemplate) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );


  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isCreating) {
        onOpenChange(val);
        if (!val) setStep("main");
      }
    }}>
      <DialogContent className={cn(
        "transition-all duration-300 ease-in-out sm:max-w-[600px] p-0 flex flex-col",
        step === "templates" ? "sm:max-w-[90vw] md:max-w-[1000px] h-[85vh]" : "max-h-[90vh]"
      )}>

        {step === "main" ? (
          <div className="space-y-6 p-6">

            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Create a new bot</DialogTitle>
              <DialogDescription className="text-center">
                Choose how you want to start building your conversational agent.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <button
                onClick={handleStartFromScratch}
                className="group flex items-center justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <Plus className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Start from scratch</h3>
                    <p className="text-sm text-muted-foreground">Build your flow block by block from a blank canvas.</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={() => setStep("templates")}
                className="group flex items-center justify-between p-6 rounded-xl border-2 border-border bg-card hover:border-orange-500/50 hover:bg-orange-500/5 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                    <LayoutGrid className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Start from a template</h3>
                    <p className="text-sm text-muted-foreground">Kickstart your project with pre-built professional flows.</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
              </button>

            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-muted/5">
            <DialogHeader className="flex flex-row items-center gap-4 border-b px-6 pt-6 pb-4 bg-background z-10 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep("main")}
                disabled={isCreating}
              >
                <ArrowLeft className="size-4" />
              </Button>
              <div className="flex-1">
                <DialogTitle className="text-xl font-bold">Choose a template</DialogTitle>
                <DialogDescription>
                  Select a pre-configured flow to start with.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar */}
              <div className="w-[300px] border-r bg-background flex flex-col shrink-0">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search templates..."
                      className="pl-9 h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  <button
                    onClick={() => setSelectedTemplateId("import")}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                      selectedTemplateId === "import" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-md",
                      selectedTemplateId === "import" ? "bg-primary/20" : "bg-muted-foreground/10"
                    )}>
                      <FileJson className="size-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-sm">Import JSON Flow</p>
                    </div>
                  </button>

                  <div className="py-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-2">
                    Available Templates
                  </div>

                  {isLoadingTemplates ? (
                    <div className="py-8 flex justify-center">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No templates found
                    </div>
                  ) : (
                    filteredTemplates.map((template: ChatbotTemplate) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplateId(template.id)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                          selectedTemplateId === template.id 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span className="text-xl shrink-0">{template.emoji}</span>
                        <div className="flex-1 truncate">
                          <p className="text-sm truncate">{template.name}</p>
                          <p className="text-[10px] truncate opacity-70 uppercase tracking-wider mt-0.5">
                            {template.category.replace('_', ' ')}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Right Content Pane */}
              <div className="flex-1 bg-muted/10 overflow-y-auto p-8 flex flex-col relative">
                {selectedTemplateId === "import" ? (
                  <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center space-y-6">
                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="size-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Import Flow from JSON</h3>
                      <p className="text-muted-foreground">
                        Have an existing exported bot? Upload your .json file here to instantly recreate the flow.
                      </p>
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".json"
                      onChange={handleFileChange}
                    />
                    
                    <Button 
                      size="lg" 
                      className="w-full gap-2 py-6 text-base"
                      onClick={handleImportClick}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Loader2 className="size-5 animate-spin" />
                      ) : (
                        <Download className="size-5 rotate-180" />
                      )}
                      Select JSON File
                    </Button>
                    <p className="text-xs text-muted-foreground pt-4">
                      File must be a valid JSON export from the Bot Builder.
                    </p>
                  </div>
                ) : (
                  // Template Details
                  (() => {
                    const template = allTemplates.find((t: ChatbotTemplate) => t.id === selectedTemplateId);
                    if (!template) return null;

                    return (
                      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="size-16 rounded-2xl bg-background border flex items-center justify-center text-4xl shadow-sm">
                            {template.emoji}
                          </div>
                          <div>
                            <Badge variant="secondary" className="mb-2 text-[10px] uppercase tracking-wider">
                              {template.category.replace('_', ' ')}
                            </Badge>
                            <h2 className="text-2xl font-bold">{template.name}</h2>
                          </div>
                        </div>

                        <div className="bg-background border rounded-xl p-6 shadow-sm mb-6 flex-1 flex flex-col">
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">About this template</h4>
                          <p className="text-foreground leading-relaxed flex-1">
                            {template.description}
                          </p>

                          <div className="mt-8 border-t pt-6">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Included Features</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                                <CheckCircle2 className="size-4 text-green-500" /> Pre-configured Nodes
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                                <CheckCircle2 className="size-4 text-green-500" /> Best Practice Flow
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                                <CheckCircle2 className="size-4 text-green-500" /> Customizable
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2.5 rounded-lg border">
                                <CheckCircle2 className="size-4 text-green-500" /> Ready to Deploy
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="lg"
                          className="w-full gap-2 shadow-md py-6 text-base"
                          onClick={() => handleUseTemplate(template)}
                          disabled={isCreating}
                        >
                          {isCreating ? (
                            <Loader2 className="size-5 animate-spin" />
                          ) : (
                            <LayoutGrid className="size-5" />
                          )}
                          Use {template.name} Template
                        </Button>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
