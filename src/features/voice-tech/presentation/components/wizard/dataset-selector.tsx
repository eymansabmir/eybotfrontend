import { useState } from "react";
import { 
  Database, 
  Check, 
  ChevronDown, 
  Plus, 
  Search,
  FileSpreadsheet,
  X
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
    <div className="space-y-3">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between h-12 px-4 bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all rounded-md shadow-none"
            >
              <div className="flex items-center gap-3">
                <div className="size-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <Database className="size-3.5" />
                </div>
                {selectedDatasets.length > 0 ? (
                  <span className="font-bold text-sm text-slate-900">{selectedDatasets.length} dataset{selectedDatasets.length !== 1 ? 's' : ''} selected</span>
                ) : (
                  <span className="text-slate-400 text-sm font-medium">Select a validated source...</span>
                )}
              </div>
              <ChevronDown className="size-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] p-2 rounded-xl shadow-xl border-slate-200">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <Input 
                placeholder="Search datasets..." 
                className="pl-8 h-9 text-xs bg-slate-50 border-slate-100 rounded-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 px-2 py-1.5">
              Available Datasets
            </DropdownMenuLabel>
            <ScrollArea className="h-48">
              {filteredDatasets.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-slate-400 font-medium mb-2">No datasets found</p>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-slate-600" onClick={() => setIsDrawerOpen(true)}>
                    <Plus className="size-3 mr-1" />
                    Upload One
                  </Button>
                </div>
              ) : (
                filteredDatasets.map((d) => (
                  <DropdownMenuItem 
                    key={d.id} 
                    className="flex items-center justify-between rounded-md py-2.5 px-3 cursor-pointer hover:bg-slate-50"
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleDataset(d.id);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="size-3.5 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">{d.name}</span>
                    </div>
                    {selectedDatasetIds.includes(d.id) && (
                      <div className="size-5 rounded-full bg-slate-900 flex items-center justify-center">
                        <Check className="size-3 text-white" />
                      </div>
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem 
              className="flex items-center gap-2 font-bold py-2.5 px-3 cursor-pointer rounded-md text-slate-700 hover:bg-slate-50"
              onClick={() => setIsDrawerOpen(true)}
            >
              <div className="size-5 rounded-md bg-slate-900 flex items-center justify-center">
                <Plus className="size-3 text-white" />
              </div>
              Upload New Dataset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedDatasets.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {selectedDatasets.map(d => (
            <div
              key={d.id}
              className="inline-flex items-center gap-2 h-8 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-700"
            >
              <FileSpreadsheet className="size-3.5 text-slate-500 shrink-0" />
              <span className="text-xs font-bold truncate max-w-[120px]">{d.name}</span>
              <button 
                onClick={() => toggleDataset(d.id)}
                className="size-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center transition-colors ml-1 shrink-0"
                aria-label={`Remove ${d.name}`}
              >
                <X className="size-2.5 text-slate-600" />
              </button>
            </div>
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
