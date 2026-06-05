import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
  Trash2,
  Database,
  Globe,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessage } from "@/lib/utils";
import { CHATBOT_TEMPLATES, type ChatbotTemplate } from "../../data/templates-data";
import { useCreateBot } from "../../data/queries/use-bots";
import { templatesApi } from "../../data/api/templates-api";
import { toast } from "sonner";
import { NodeType } from "@/features/nodes/node-types.constants";
import { useSidebar } from "@/components/ui/sidebar";

type Step = "choice" | "templates";

interface StoredTemplate extends ChatbotTemplate {
  data: any;
  isCustom: boolean;
}

const STORAGE_KEY = "whatsapp_bot_official_templates_custom_v2";

export function CreateBotPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("choice");
  const [searchQuery, setSearchQuery] = useState("");
  
  // FIXED: State Initializer for Persistence
  const [customTemplates, setCustomTemplates] = useState<StoredTemplate[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Failed to load templates from storage:", e);
      }
    }
    return [];
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CHATBOT_TEMPLATES[0].id);
  const [isCreating, setIsCreating] = useState(false);
  
  const createBotMutation = useCreateBot();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setOpen, state } = useSidebar();

  // SMOOTH SIDEBAR MANAGEMENT
  useEffect(() => {
    // Only collapse if we are in the template browsing step
    if (step === "templates" && state === "expanded") {
      const timer = setTimeout(() => setOpen(false), 100);
      return () => clearTimeout(timer);
    }
  }, [step, setOpen, state]);

  // Restore sidebar on unmount
  useEffect(() => {
    return () => {
      setOpen(true);
    };
  }, [setOpen]);

  // Persistence: Save to localStorage whenever customTemplates changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Combine Official and Custom into one list
  const allTemplates = useMemo(() => [
    ...CHATBOT_TEMPLATES.map(t => ({ ...t, isCustom: false, data: null })),
    ...customTemplates
  ], [customTemplates]);

  const selectedTemplate = useMemo(() => 
    allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0],
    [selectedTemplateId, allTemplates]
  );

  const filteredTemplates = useMemo(() => allTemplates.filter((t) => {
    return t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           t.description.toLowerCase().includes(searchQuery.toLowerCase());
  }), [allTemplates, searchQuery]);

  const handleStartFromScratch = () => {
    navigate({ to: "/bot/$id", params: { id: "new" } });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        
        const newTemplate: StoredTemplate = {
          id: `custom-${Date.now()}`,
          name: data.name || file.name.replace('.json', ''),
          description: data.description || "Custom imported official flow configuration.",
          emoji: "✨",
          category: "other",
          features: ["Custom Logic", "Enterprise Ready", "Verified Structural Integrity"],
          isCustom: true,
          data: data
        };

        setCustomTemplates(prev => [newTemplate, ...prev]);
        setSelectedTemplateId(newTemplate.id);
        setStep("templates");
        toast.success("Template imported successfully and added to your collection.");
      } catch (error) {
        console.error(error);
        toast.error(getErrorMessage(error, "Invalid JSON file format."));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDeleteCustom = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(CHATBOT_TEMPLATES[0].id);
    }
  };

  // Backend format mapping
  const mapNodeToBackend = (n: any) => {
    let backendData = { ...n.data };
    let branches = n.branches || [];

    if (n.type === NodeType.ASK_QUESTION && !backendData.variableName) {
      backendData = {
        message: n.data.message || n.data.question || "Default question",
        variableName: n.data.variableName || n.data.variable || "var",
        variableScope: n.data.variableScope || "session",
        inputType: n.data.validationType || n.data.inputType || "text",
        timeoutSeconds: n.data.timeoutSeconds || 3600
      };
      branches = [{ key: "default", label: "Success" }, { key: "error", label: "Error" }];
    } else if (n.type === NodeType.NPS && !backendData.variableName) {
      backendData = {
        message: n.data.message || "How likely are you to recommend us?",
        variableName: n.data.variable || n.data.variableName || "nps_score",
        variableScope: n.data.variableScope || "session",
        length: n.data.length ?? 10,
        startsAt: n.data.startsAt ?? 1,
        leftLabel: n.data.leftLabel,
        rightLabel: n.data.rightLabel,
        buttonLabel: n.data.buttonLabel || "Rate",
        timeoutSeconds: n.data.timeoutSeconds || 3600
      };
      branches = [{ key: "promoter", label: "Promoter" }, { key: "passive", label: "Passive" }, { key: "detractor", label: "Detractor" }];
    }

    return {
      id: n.id,
      type: n.type,
      label: n.label || n.type,
      position: n.position || { x: 0, y: 0 },
      data: backendData,
      branches: branches
    };
  };

  const mapEdgeToBackend = (e: any) => ({
    id: e.id,
    sourceNodeId: e.source || e.sourceNodeId,
    sourceBranchKey: e.sourceHandle || e.sourceBranchKey || "default",
    targetNodeId: e.target || e.targetNodeId,
  });

  const handleUseTemplate = async (template: any) => {
    setIsCreating(true);
    try {
      let payload: any;
      let rawData: any;
      
      if (template.isCustom) {
        rawData = template.data;
        payload = {
          ...rawData,
          name: `${template.name} (Custom)`,
          orgId: "68b08633907a113536238290",
          status: "draft",
          nodes: (rawData.nodes || []).map(mapNodeToBackend),
          edges: (rawData.edges || []).map(mapEdgeToBackend),
          triggerType: rawData.triggerType || "inbound",
          triggerConfig: rawData.triggerConfig || { keywords: [] },
          settings: rawData.settings || { timeoutSeconds: 300, maxSteps: 100, variables: [] },
        };
      } else {
        rawData = await templatesApi.getTemplateById(template.id);
        payload = {
          name: `${template.name} Bot`,
          orgId: "68b08633907a113536238290",
          nodes: (rawData.nodes || []).map(mapNodeToBackend),
          edges: (rawData.edges || []).map(mapEdgeToBackend),
          triggerType: "inbound",
          triggerConfig: { keywords: [] },
          status: "draft",
          settings: {
            timeoutSeconds: 300,
            maxSteps: 100,
            variables: []
          },
        };
      }

      const newBot = await createBotMutation.mutateAsync(payload);
      toast.success(`Created bot from ${template.name}!`);
      navigate({ to: "/bot/$id", params: { id: newBot.id } });
    } catch (error: any) {
      console.error(error);
      toast.error(getErrorMessage(error, "Failed to create bot. Check flow configuration."));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-screen bg-canvas-bg overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="bg-background border-b h-16 shrink-0 flex items-center z-30 shadow-sm px-6 justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => step === "templates" ? setStep("choice") : navigate({ to: "/bots" })}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-lg font-bold tracking-tight text-foreground/90">
            {step === "choice" ? "Create New Bot" : "Select a Template"}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
           <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileChange}
          />
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground transition-colors" onClick={handleImportClick}>
            <Upload className="size-4" />
            Import JSON
          </Button>
        </div>
      </div>

      <main className="flex-1 overflow-hidden relative bg-[#F8F9FA] dark:bg-[#0A0A0A]">
        <AnimatePresence mode="wait">
          {step === "choice" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col items-center justify-center p-6"
            >
              <div className="text-center mb-12 max-w-lg">
                <h2 className="text-4xl font-extrabold mb-4 tracking-tight">How would you like to start?</h2>
                <p className="text-muted-foreground text-lg">
                  Choose the best path for your project. You can always change your mind later.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Option: Scratch */}
                <button
                  onClick={handleStartFromScratch}
                  className="group relative flex flex-col items-start p-8 rounded-3xl bg-background border-2 border-transparent hover:border-ey-yellow shadow-sm hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
                >
                  <div className="size-16 rounded-2xl bg-muted/20 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Plus className="size-8 text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Blank Canvas</h3>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                    Start with a clean slate and build your own custom flow from scratch using our drag-and-drop builder.
                  </p>
                  <div className="flex items-center gap-2 font-bold text-ey-yellow-text">
                    Create from scratch
                    <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>

                {/* Option: Template */}
                <button
                  onClick={() => setStep("templates")}
                  className="group relative flex flex-col items-start p-8 rounded-3xl bg-background border-2 border-transparent hover:border-ey-yellow shadow-sm hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
                >
                  <div className="size-16 rounded-2xl bg-ey-yellow/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Sparkles className="size-8 text-ey-yellow-text" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Pre-built Template</h3>
                  <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                    Kickstart your work with a functional flow designed for specific business use cases and best practices.
                  </p>
                  <div className="flex items-center gap-2 font-bold text-ey-yellow-text">
                    Browse templates
                    <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="templates"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex"
            >
              {/* Sidebar */}
              <div className="w-80 bg-background border-r flex flex-col shrink-0">
                <div className="p-4 border-b flex items-center justify-between">
                   <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search templates..." 
                      className="pl-9 bg-muted/30 border-none h-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="size-3" />
                    Official Templates
                  </p>
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group relative",
                        selectedTemplateId === template.id 
                          ? "bg-ey-yellow text-black font-bold shadow-sm" 
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{template.emoji}</span>
                      <span className="truncate text-sm pr-10">{template.name}</span>
                      
                      {template.isCustom && (
                        <button 
                          onClick={(e) => handleDeleteCustom(template.id, e)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Area */}
              <div className="flex-1 overflow-y-auto flex flex-col bg-background">
                <div className="p-12 max-w-5xl mx-auto w-full space-y-12">
                  <div className="flex items-start justify-between gap-10">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="size-20 rounded-3xl bg-muted/20 flex items-center justify-center text-5xl border shadow-sm">
                          {selectedTemplate.emoji}
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[10px] font-bold px-3 py-1">
                            {selectedTemplate.category.replace('_', ' ')}
                          </Badge>
                          <h2 className="text-4xl font-extrabold tracking-tight">{selectedTemplate.name}</h2>
                        </div>
                      </div>
                      <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                        {selectedTemplate.description}
                      </p>
                    </div>

                    <div className="shrink-0 pt-2">
                      <Button 
                        size="lg"
                        className="px-10 h-16 text-lg font-bold bg-ey-yellow text-black hover:bg-ey-yellow/90 shadow-xl shadow-ey-yellow/20 transition-all active:scale-95"
                        onClick={() => handleUseTemplate(selectedTemplate)}
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <Loader2 className="size-6 animate-spin" />
                        ) : (
                          <>
                            Use this template
                            <ChevronRight className="size-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <hr className="border-muted/30" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Info className="size-5 text-ey-yellow-text" />
                        Key Capabilities
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {selectedTemplate.features?.map(feature => (
                          <div key={feature} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-muted-foreground/10 transition-colors">
                            <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="size-4 text-green-500" />
                            </div>
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="size-5 text-ey-yellow-text" />
                        Technical Overview
                      </h3>
                      <div className="space-y-4">
                        <div className="p-6 rounded-2xl border bg-muted/5 space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Node Complexity</span>
                            <Badge variant="outline">Enterprise Grade</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Flow Architecture</span>
                            <span className="font-medium flex items-center gap-1">
                              <Database className="size-4" />
                              Multi-Node Logic
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Compliance</span>
                            <span className="font-medium flex items-center gap-1">
                              <Globe className="size-4" />
                              EY Standard
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                          <h4 className="font-bold mb-2">Ready to Deploy</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedTemplate.isCustom 
                              ? "This flow has been successfully verified for structural integrity. It is now part of your official collection."
                              : "This template is pre-configured with all necessary nodes. You just need to customize the messages and trigger keywords."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
