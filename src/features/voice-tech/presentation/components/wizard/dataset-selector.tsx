import { useState } from "react";
import { 
  Database, 
  Upload, 
  Check, 
  ChevronDown, 
  Plus, 
  Search,
  FileSpreadsheet,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CsvUploadPanel } from "../ingest/csv-upload-panel";

interface DatasetSelectorProps {
  datasets: { id: string; name: string }[];
  selectedDatasetId: string | null;
  onSelect: (id: string) => void;
  tenantId: string;
}

export function DatasetSelector({ datasets, selectedDatasetId, onSelect, tenantId }: DatasetSelectorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);
  const filteredDatasets = datasets.filter((d) => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground ml-1">Select Dataset</label>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between h-12 px-4 bg-card border-border/60 hover:border-primary/50 transition-all rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <Database className="size-3.5" />
                  </div>
                  {selectedDataset ? (
                    <span className="font-medium">{selectedDataset.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Choose an existing dataset...</span>
                  )}
                </div>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-xl shadow-xl border-border/60">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Search datasets..." 
                  className="pl-8 h-9 text-xs bg-muted/30 border-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                Existing Datasets
              </DropdownMenuLabel>
              <ScrollArea className="h-48">
                {filteredDatasets.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No datasets found
                  </div>
                ) : (
                  filteredDatasets.map((d) => (
                    <DropdownMenuItem 
                      key={d.id} 
                      className="flex items-center justify-between rounded-lg py-2 px-3 cursor-pointer"
                      onClick={() => onSelect(d.id)}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      {selectedDatasetId === d.id && <Check className="size-4 text-primary" />}
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center gap-2 text-primary focus:text-primary font-semibold py-2.5 cursor-pointer"
                onClick={() => setIsDrawerOpen(true)}
              >
                <Plus className="size-4" />
                Upload New Dataset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="secondary" 
            className="h-12 px-4 rounded-xl shadow-sm border border-border/40"
            onClick={() => setIsDrawerOpen(true)}
          >
            <Upload className="size-4" />
          </Button>
        </div>
      </div>

      {selectedDataset && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Tag className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Selected Source</p>
              <h4 className="text-sm font-bold text-foreground">{selectedDataset.name}</h4>
            </div>
            <Badge variant="outline" className="ml-auto bg-white/50 backdrop-blur-sm border-primary/20 text-primary">
              Active Dataset
            </Badge>
          </div>
        </div>
      )}

      {/* Upload Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[450px] p-0 border-l border-border/60">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b bg-muted/10">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Upload className="size-6" />
              </div>
              <SheetTitle className="text-xl font-bold">Upload New Dataset</SheetTitle>
              <SheetDescription>
                Import a CSV file to create a new dataset for your orchestration.
              </SheetDescription>
            </SheetHeader>
            
            <div className="flex-1 p-6 overflow-y-auto">
              <CsvUploadPanel tenantId={tenantId} entityType="" />
            </div>

            <SheetFooter className="p-6 border-t bg-muted/10">
              <Button variant="ghost" onClick={() => setIsDrawerOpen(false)} className="w-full">
                Close
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
