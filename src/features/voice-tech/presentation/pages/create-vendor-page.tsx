import { useNavigate, useSearch } from "@tanstack/react-router";
import { 
  Key,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VendorForm } from "../components/vendors/vendor-form";

export function CreateVendorPage() {
  const navigate = useNavigate();

  const search = useSearch({ from: "/voice-tech/vendors/create" }) as any;
  const returnTo = search.returnTo || "/voice-tech/vendors";

  const handleSuccess = () => {
    navigate({ to: returnTo });
  };

  const handleCancel = () => {
    navigate({ to: returnTo });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
          <Key className="size-3.5" />
          Vendor Management
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleCancel}
            className="rounded-full bg-card border border-border shadow-sm hover:bg-muted shrink-0"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              ORCHESTRATOR <span className="mx-2 text-muted-foreground/30">›</span> VENDORS <span className="mx-2 text-muted-foreground/30">›</span> NEW VENDOR
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mt-0.5">
              Connect Voice Provider
            </h1>
          </div>
        </div>
        <p className="text-sm font-medium text-muted-foreground max-w-2xl mt-2 ml-14">
          Securely link institutional AI voice engines and telephony carriers to your orchestration engine.
        </p>
      </div>


      {/* ── Form Card ─────────────────────────────────────── */}
      <Card className="border-border shadow-sm overflow-hidden rounded-2xl bg-card">
        <CardContent className="p-8">
          <VendorForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>

      {/* ── Footer Info ───────────────────────────────────── */}
      <div className="flex items-center justify-center gap-8 py-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
         <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/ElevenLabs_logo.png" className="h-4" alt="ElevenLabs" />
         <div className="h-4 w-[1px] bg-border" />
         <img src="https://vapi.ai/logo.png" className="h-4" alt="Vapi" />
         <div className="h-4 w-[1px] bg-border" />
         <p className="text-[10px] font-bold tracking-tighter uppercase italic">Institutional Connectors Enabled</p>
      </div>
    </div>
  );
}
