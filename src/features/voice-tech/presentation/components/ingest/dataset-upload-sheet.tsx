import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { CsvUploadPanel } from "./csv-upload-panel";

interface DatasetUploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function DatasetUploadSheet({ open, onOpenChange, tenantId }: DatasetUploadSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 border-l border-border shadow-xl">
        <div className="flex flex-col h-full bg-background">
          
          {/* Header */}
          <div className="flex items-start justify-between p-7 border-b border-border">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Data Library › Upload
              </p>
              <SheetTitle className="text-xl font-extrabold tracking-tight text-foreground">
                Upload Dataset
              </SheetTitle>
              <SheetDescription className="text-sm font-medium text-muted-foreground leading-relaxed max-w-[320px]">
                Import your CSV or Excel file. The system will automatically detect fields and types.
              </SheetDescription>
            </div>
          </div>
          
          {/* Info Bar */}
          <div className="flex items-center gap-3 px-7 py-4 bg-muted/30 border-b border-border">
            <div className="size-8 rounded-md bg-slate-900 flex items-center justify-center shrink-0">
              <Upload className="size-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                Dataset Configuration
              </p>
              <p className="text-[11px] text-muted-foreground/60 font-medium">CSV, XLS, XLSX supported</p>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-7 overflow-y-auto">
            <CsvUploadPanel tenantId={tenantId} entityType="" />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full h-11 rounded-md border-border font-bold text-muted-foreground hover:bg-muted transition-all"
            >
              Close Panel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
