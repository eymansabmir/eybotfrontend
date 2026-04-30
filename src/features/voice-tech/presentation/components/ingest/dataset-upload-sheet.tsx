import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet } from "lucide-react";
import { CsvUploadPanel } from "./csv-upload-panel";

interface DatasetUploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function DatasetUploadSheet({ open, onOpenChange, tenantId }: DatasetUploadSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[460px] p-0 border-l border-border/40 shadow-2xl">
        <div className="flex flex-col h-full bg-card">
          {/* Header Section */}
          <div className="p-8 border-b bg-muted/5 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -top-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/10">
                <Upload className="size-7" strokeWidth={1.5} />
              </div>
              <SheetTitle className="text-2xl font-bold tracking-tight text-foreground">Upload Dataset</SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Import your CSV file to create a new dataset. Our system will automatically detect fields and types for your orchestration.
              </SheetDescription>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <FileSpreadsheet className="size-3" />
              Dataset Configuration
            </div>
            <CsvUploadPanel tenantId={tenantId} entityType="" />
          </div>

          {/* Footer Section */}
          <div className="p-6 border-t bg-muted/5">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full h-12 rounded-xl border-border/60 hover:bg-muted font-semibold transition-all"
            >
              Close Panel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
