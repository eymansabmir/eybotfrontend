import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBots } from "@/features/bots/data/queries/use-bots";

interface CreateSyncJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    dataSources: any[];
}

export function CreateSyncJobDialog({ open, onOpenChange, onSuccess, dataSources }: CreateSyncJobDialogProps) {
    const { data: bots = [] } = useBots();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        botId: "",
        dataSourceId: "",
        sqlQuery: "SELECT id as wa_id, name, order_id FROM users WHERE id > :lastCursor",
        cursorField: "id",
        cronSchedule: "0 * * * *",
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
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Automation Sync Job</DialogTitle>
                        <DialogDescription>
                            Define a SQL query to fetch recipients and trigger bots automatically.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right text-xs">Job Name</Label>
                            <Input 
                                placeholder="e.g. Daily Payment Reminder" 
                                className="col-span-3" 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 ml-[100px]">
                            <div className="space-y-2">
                                <Label className="text-xs">Target Bot</Label>
                                <Select value={formData.botId} onValueChange={(val) => setFormData({...formData, botId: val})}>
                                    <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Select Bot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bots.map((bot: any) => (
                                            <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Data Source</Label>
                                <Select value={formData.dataSourceId} onValueChange={(val) => setFormData({...formData, dataSourceId: val})}>
                                    <SelectTrigger className="text-xs">
                                        <SelectValue placeholder="Select DB" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dataSources.map((ds: any) => (
                                            <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">SQL Query (Postgres/MySQL)</Label>
                            <Textarea 
                                className="font-mono text-xs min-h-[150px]" 
                                value={formData.sqlQuery}
                                onChange={(e) => setFormData({...formData, sqlQuery: e.target.value})}
                                required
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                * SQL must return 'wa_id' column for phone numbers.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Cursor Field (High Watermark)</Label>
                                <Input 
                                    placeholder="e.g. id or updated_at" 
                                    value={formData.cursorField}
                                    onChange={(e) => setFormData({...formData, cursorField: e.target.value})}
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">Used for incremental syncs.</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Schedule (Cron)</Label>
                                <Select value={formData.cronSchedule} onValueChange={(val) => setFormData({...formData, cronSchedule: val})}>
                                    <SelectTrigger className="text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0 * * * *">Every Hour</SelectItem>
                                        <SelectItem value="0 0 * * *">Every Day (Midnight)</SelectItem>
                                        <SelectItem value="*/15 * * * *">Every 15 Minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Validating SQL..." : "Schedule Sync Job"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
