import { 
  Sheet, 
  SheetContent, 
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { CsvUploadPanel } from "./csv-upload-panel";

interface DatasetUploadSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
}

export function DatasetUploadSheet({ open, onOpenChange, tenantId }: DatasetUploadSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[480px] p-0 border-l border-slate-200 shadow-xl">
        <div className="flex flex-col h-full bg-white">
          
          {/* Header */}
          <div className="flex items-start justify-between p-7 border-b border-slate-100">
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Data Library › Upload
              </p>
              <SheetTitle className="text-xl font-extrabold tracking-tight text-slate-900">
                Upload Dataset
              </SheetTitle>
              <SheetDescription className="text-sm font-medium text-slate-500 leading-relaxed max-w-[320px]">
                Import your CSV or Excel file. The system will automatically detect fields and types.
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 shrink-0 mt-1"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          
          {/* Info Bar */}
          <div className="flex items-center gap-3 px-7 py-4 bg-slate-50 border-b border-slate-100">
            <div className="size-8 rounded-md bg-slate-900 flex items-center justify-center shrink-0">
              <Upload className="size-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">
                Dataset Configuration
              </p>
              <p className="text-[11px] text-slate-400 font-medium">CSV, XLS, XLSX supported</p>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 p-7 overflow-y-auto">
            <CsvUploadPanel tenantId={tenantId} entityType="" />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="w-full h-11 rounded-md border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Close Panel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
