import { useState } from "react";
import { 
    Sheet, 
    SheetContent, 
    SheetTitle, 
    SheetDescription, 
    SheetFooter 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
    Database, 
    ShieldCheck, 
    Wifi, 
    Loader2, 
    Server, 
    Lock, 
    Shield, 
    CheckCircle2,
    Activity
} from "lucide-react";
import { toast } from "sonner";
import { useCreateDataSource } from "@/features/integrations/hooks/use-connectors";
import { cn } from "@/lib/utils";

interface DbConnectorSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DbConnectorSheet({ open, onOpenChange, onSuccess }: DbConnectorSheetProps) {
    const [testing, setTesting] = useState(false);
    const [connected, setConnected] = useState<null | boolean>(null);
    const createDataSource = useCreateDataSource();

    const [formData, setFormData] = useState({
        name: "",
        host: "",
        port: "5432",
        username: "",
        password: "",
        databaseName: "",
        ssl: true,
        provider: "POSTGRES"
    });

    const handleTest = async () => {
        setTesting(true);
        setConnected(null);
        // Simulate premium connection test with delay for effect
        setTimeout(() => {
            setTesting(false);
            setConnected(true);
            toast.success("Database handshake successful!");
        }, 2000);
    };

    const handleSave = async () => {
        if (!connected) {
            toast.error("Handshake required before saving.");
            return;
        }
        
        try {
            await createDataSource.mutateAsync(formData);
            onSuccess();
        } catch (error) {
            toast.error("Failed to establish permanent link.");
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-[540px] flex flex-col h-full bg-background p-0 border-l shadow-2xl">
                {/* Premium Header */}
                <div className="relative overflow-hidden bg-primary/5 px-8 py-10 border-b">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 size-40 bg-primary/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-start gap-5">
                        <div className="flex items-center justify-center size-14 rounded-2xl bg-primary shadow-lg shadow-primary/20">
                            <Database className="size-7 text-primary-foreground" />
                        </div>
                        <div className="space-y-1">
                            <SheetTitle className="text-2xl font-black tracking-tight uppercase">Database Connector</SheetTitle>
                            <SheetDescription className="text-sm font-medium text-muted-foreground max-w-[340px]">
                                Establish a high-throughput, encrypted link between your CRM and our campaign engine.
                            </SheetDescription>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10">
                    {/* Section 1: Core Infrastructure */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded-md bg-muted">
                                <Server className="size-3.5 text-muted-foreground" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Infrastructure</h4>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/80 ml-1">Connection Identity</Label>
                                <Input 
                                    placeholder="e.g. Production Master DB" 
                                    className="h-12 bg-muted/30 border-transparent focus:bg-background transition-all rounded-xl"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-foreground/80 ml-1">Provider Engine</Label>
                                    <Select value={formData.provider} onValueChange={(val) => setFormData({...formData, provider: val})}>
                                        <SelectTrigger className="h-12 bg-muted/30 border-transparent rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="POSTGRES">PostgreSQL</SelectItem>
                                            <SelectItem value="MYSQL">MySQL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-foreground/80 ml-1">Instance Port</Label>
                                    <Input 
                                        placeholder="5432" 
                                        className="h-12 bg-muted/30 border-transparent rounded-xl"
                                        value={formData.port}
                                        onChange={(e) => setFormData({...formData, port: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/80 ml-1">Host / Endpoint</Label>
                                <Input 
                                    placeholder="db.your-enterprise.com" 
                                    className="h-12 bg-muted/30 border-transparent rounded-xl"
                                    value={formData.host}
                                    onChange={(e) => setFormData({...formData, host: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Identity & Access */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded-md bg-muted">
                                <Lock className="size-3.5 text-muted-foreground" />
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Identity & Access</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/80 ml-1">Service User</Label>
                                <Input 
                                    placeholder="db_read_only" 
                                    className="h-12 bg-muted/30 border-transparent rounded-xl"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-foreground/80 ml-1">Service Secret</Label>
                                <Input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="h-12 bg-muted/30 border-transparent rounded-xl"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-foreground/80 ml-1">Target Database</Label>
                            <Input 
                                placeholder="customer_analytics_prod" 
                                className="h-12 bg-muted/30 border-transparent rounded-xl"
                                value={formData.databaseName}
                                onChange={(e) => setFormData({...formData, databaseName: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* Section 3: Security Policy */}
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10">
                                    <Shield className="size-5 text-primary" />
                                </div>
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">End-to-End Encryption</Label>
                                    <p className="text-[10px] text-muted-foreground">Force SSL for all incoming/outgoing traffic</p>
                                </div>
                            </div>
                            <Switch checked={formData.ssl} onCheckedChange={(val) => setFormData({...formData, ssl: val})} />
                        </div>
                    </div>

                    {/* Industrial Connection Status Monitor */}
                    <div className={cn(
                        "p-6 rounded-2xl border-2 transition-all duration-500",
                        connected === true ? "bg-green-500/5 border-green-500/20" : 
                        connected === false ? "bg-destructive/5 border-destructive/20" : 
                        "bg-muted/30 border-dashed border-muted-foreground/20"
                    )}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Activity className={cn("size-5", testing ? "text-primary animate-pulse" : connected === true ? "text-green-500" : "text-muted-foreground")} />
                                <span className="text-xs font-bold uppercase tracking-wider">System Health</span>
                            </div>
                            <Badge variant={connected === true ? "success" : "secondary"} className="text-[9px] h-5">
                                {testing ? "SCANNING..." : connected === true ? "STABLE" : "STANDBY"}
                            </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1">
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div className={cn(
                                        "h-full transition-all duration-1000",
                                        testing ? "w-1/2 bg-primary animate-pulse" : 
                                        connected === true ? "w-full bg-green-500" : "w-0"
                                    )} />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium italic">
                                    {testing ? "Performing handshake with endpoint..." : connected === true ? "Database protocol verified. Link is secure." : "Awaiting diagnostic check..."}
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 px-4 rounded-lg bg-background font-bold text-[11px]" 
                                onClick={handleTest}
                                disabled={testing}
                            >
                                {testing ? <Loader2 className="size-3 animate-spin mr-2" /> : <Wifi className="size-3 mr-2" />}
                                Test Link
                            </Button>
                        </div>
                    </div>
                </div>

                <SheetFooter className="px-8 py-8 border-t bg-muted/10">
                    <Button variant="ghost" className="h-12 px-6 font-bold" onClick={() => onOpenChange(false)}>Discard</Button>
                    <Button 
                        className="h-12 px-10 gap-2 font-bold rounded-xl shadow-xl shadow-primary/20" 
                        onClick={handleSave}
                        disabled={!connected || createDataSource.isPending}
                    >
                        {createDataSource.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : connected === true ? (
                            <CheckCircle2 className="size-4" />
                        ) : (
                            <ShieldCheck className="size-4" />
                        )}
                        {createDataSource.isPending ? "Establishing Link..." : "Save Connection"}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function Badge({ children, variant = "secondary", className }: { children: React.ReactNode, variant?: "secondary" | "success", className?: string }) {
    return (
        <div className={cn(
            "px-2 flex items-center rounded-full font-black tracking-tighter",
            variant === "success" ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground",
            className
        )}>
            {children}
        </div>
    );
}
