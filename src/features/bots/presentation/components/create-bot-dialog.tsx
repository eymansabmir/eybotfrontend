import { useState } from "react";
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
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type ChatbotTemplate } from "../../data/templates-data";
import { useNavigate } from "@tanstack/react-router";
import { useCreateBot } from "../../data/queries/use-bots";
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
  const navigate = useNavigate();
  const createBotMutation = useCreateBot();
  const { data: templates = [], isLoading: isLoadingTemplates } = useTemplates();


  const handleStartFromScratch = () => {
    onOpenChange(false);
    navigate({ to: "/bot/$id", params: { id: "new" } });
  };

  const handleUseTemplate = async (template: ChatbotTemplate) => {
    setIsCreating(true);
    try {
      // Fetch the template JSON from backend
      const templateData = await templatesApi.getTemplateById(template.id);


      // Create the bot using the template data
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

      const newBot = await createBotMutation.mutateAsync(payload as any);
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

  const filteredTemplates = (templates || []).filter((t: ChatbotTemplate) =>
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

              <button
                disabled
                className="group flex items-center justify-between p-6 rounded-xl border-2 border-border bg-muted/50 opacity-60 cursor-not-allowed text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                    <Upload className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">Import a file</h3>
                      <Badge variant="outline" className="text-[10px] uppercase">Soon</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Upload a .json file from a previous export.</p>
                  </div>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <DialogHeader className="flex flex-row items-center gap-4 border-b px-6 pt-6 pb-4 sticky top-0 bg-background z-10">

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
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {filteredTemplates.map((template: ChatbotTemplate) => (
                  <div
                    key={template.id}
                    className="group relative rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{template.emoji}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          {template.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-bold text-base group-hover:text-primary transition-colors">{template.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {template.description}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      variant="outline"
                      onClick={() => handleUseTemplate(template)}
                      disabled={isCreating}
                    >
                      {isCreating ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 size-4" />
                      )}
                      Use this template
                    </Button>
                  </div>
                ))}
              </div>

              {isLoadingTemplates ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <Loader2 className="size-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground mt-4">Loading templates...</p>
                </div>
              ) : filteredTemplates.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Search className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-lg">No templates found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search query.</p>
                </div>
              )}

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
