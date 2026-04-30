import { useState } from "react";
import { 
  Database, 
  Check, 
  ChevronDown, 
  Plus, 
  Search,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

import { DatasetUploadSheet } from "../ingest/dataset-upload-sheet";

interface DatasetSelectorProps {
  datasets: { id: string; name: string }[];
  selectedDatasetIds: string[];
  onSelect: (ids: string[]) => void;
  tenantId: string;
}

export function DatasetSelector({ datasets, selectedDatasetIds, onSelect, tenantId }: DatasetSelectorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedDatasets = datasets.filter((d) => selectedDatasetIds.includes(d.id));
  const filteredDatasets = datasets.filter((d) => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDataset = (id: string) => {
    const newIds = selectedDatasetIds.includes(id)
      ? selectedDatasetIds.filter((i) => i !== id)
      : [...selectedDatasetIds, id];
    onSelect(newIds);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground ml-1">Select Datasets</label>
        
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
                  {selectedDatasets.length > 0 ? (
                    <span className="font-medium">{selectedDatasets.length} datasets selected</span>
                  ) : (
                    <span className="text-muted-foreground">Choose datasets...</span>
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
                Available Datasets
              </DropdownMenuLabel>
              <ScrollArea className="h-48">
                {filteredDatasets.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-muted-foreground mb-2">No datasets found</p>
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setIsDrawerOpen(true)}>
                      <Plus className="size-3 mr-1" />
                      Upload One
                    </Button>
                  </div>
                ) : (
                  filteredDatasets.map((d) => (
                    <DropdownMenuItem 
                      key={d.id} 
                      className="flex items-center justify-between rounded-lg py-2 px-3 cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleDataset(d.id);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="size-3.5 text-blue-500" />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      {selectedDatasetIds.includes(d.id) && <Check className="size-4 text-primary" />}
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
        </div>
      </div>

      {selectedDatasets.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {selectedDatasets.map(d => (
            <Badge key={d.id} variant="secondary" className="pl-1 pr-2 py-1 gap-1.5 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary rounded-lg transition-all">
              <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center">
                <Database className="size-2.5" />
              </div>
              {d.name}
              <button 
                onClick={() => toggleDataset(d.id)}
                className="ml-1 hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition-colors"
              >
                <Plus className="size-2.5 rotate-45" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Upload Drawer */}
      <DatasetUploadSheet 
        open={isDrawerOpen} 
        onOpenChange={setIsDrawerOpen} 
        tenantId={tenantId} 
      />
    </div>
  );
}
