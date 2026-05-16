import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface CreateDataSourceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateDataSourceDialog({ open, onOpenChange, onSuccess }: CreateDataSourceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "POSTGRES",
        credentialId: "",
        host: "",
        port: 5432,
        database: "",
        ssl: false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // API call logic will go here
        setTimeout(() => {
            setLoading(false);
            onSuccess();
            onOpenChange(false);
        }, 1000);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Connect External Database</DialogTitle>
                        <DialogDescription>
                            Enter your connection details. Credentials are encrypted via AES-256.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-xs">Name</Label>
                            <Input 
                                id="name" 
                                placeholder="e.g. Production CRM" 
                                className="col-span-3" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs">Type</Label>
                            <Select 
                                value={formData.type} 
                                onValueChange={(val) => setFormData({...formData, type: val})}
                            >
                                <SelectTrigger className="col-span-3 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="POSTGRES">PostgreSQL</SelectItem>
                                    <SelectItem value="MYSQL">MySQL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs">Host</Label>
                            <Input 
                                placeholder="db.example.com" 
                                className="col-span-3" 
                                value={formData.host}
                                onChange={(e) => setFormData({...formData, host: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 ml-[100px]">
                            <div className="space-y-2">
                                <Label className="text-xs">Port</Label>
                                <Input 
                                    type="number" 
                                    value={formData.port}
                                    onChange={(e) => setFormData({...formData, port: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Database</Label>
                                <Input 
                                    placeholder="my_db" 
                                    value={formData.database}
                                    onChange={(e) => setFormData({...formData, database: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs">SSL</Label>
                            <div className="flex items-center space-x-2 col-span-3">
                                <Switch 
                                    checked={formData.ssl} 
                                    onCheckedChange={(val) => setFormData({...formData, ssl: val})} 
                                />
                                <span className="text-[10px] text-muted-foreground italic">Require secure connection</span>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Testing Connection..." : "Save Connection"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
