import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw, Plus, Trash2, Play, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateDataSourceDialog } from "../components/create-data-source-dialog";
import { CreateSyncJobDialog } from "../components/create-sync-job-dialog";
import { useDataSources, useSyncJobs, useRunSyncJob, useDeleteDataSource } from "../../hooks/use-connectors";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ConnectorsPage() {
    const [dsOpen, setDsOpen] = useState(false);
    const [sjOpen, setSjOpen] = useState(false);

    const { data: sources = [], isLoading: loadingSources } = useDataSources();
    const { data: syncs = [], isLoading: loadingSyncs } = useSyncJobs();
    const runSync = useRunSyncJob();
    const deleteSource = useDeleteDataSource();

    const handleRunSync = async (id: string) => {
        toast.promise(runSync.mutateAsync(id), {
            loading: "Starting sync...",
            success: "Sync completed successfully",
            error: (err) => `Sync failed: ${err.message}`,
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Managed Connectors</h1>
                    <p className="text-muted-foreground">
                        Connect your enterprise databases and automate bot triggers.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="sources" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="sources" className="flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Data Sources
                    </TabsTrigger>
                    <TabsTrigger value="syncs" className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Sync Jobs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="sources" className="mt-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Database Connections</h2>
                        <Button className="flex items-center gap-2" onClick={() => setDsOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Add Data Source
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sources.map((source: any) => (
                            <Card key={source.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Database className="w-5 h-5 text-primary" />
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteSource.mutate(source.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <CardTitle className="mt-4">{source.name}</CardTitle>
                                    <CardDescription>{source.type} • {source.config.host}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-[10px] text-muted-foreground">
                                        Linked Credential: <span className="font-medium text-foreground">{source.credential?.name || 'N/A'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {sources.length === 0 && !loadingSources && (
                            <Card className="col-span-full border-dashed border-2 bg-muted/50">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                    <div className="p-4 bg-background rounded-full shadow-sm">
                                        <Database className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>No Data Sources</CardTitle>
                                        <CardDescription>Connect a Postgres or MySQL database to get started.</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setDsOpen(true)}>Connect External DB</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="syncs" className="mt-6 space-y-4">
                     <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Automated Sync Jobs</h2>
                        <Button className="flex items-center gap-2" onClick={() => setSjOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Create Sync Job
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {syncs.map((job: any) => (
                            <Card key={job.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between p-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${job.status === 'FAILED' ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
                                                <RefreshCw className={`w-6 h-6 ${job.status === 'FAILED' ? 'text-destructive' : 'text-green-600'}`} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold">{job.name}</h3>
                                                    <Badge variant={job.status === 'SUCCESS' ? 'default' : 'secondary'} className="text-[10px] px-1 h-4">
                                                        {job.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                                                    {job.sqlQuery}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Processed</p>
                                                <p className="text-xl font-black">{job.totalRecordsProcessed.toLocaleString()}</p>
                                            </div>
                                            <div className="flex items-center gap-2 border-l pl-6">
                                                <Button size="sm" variant="outline" className="gap-2" onClick={() => handleRunSync(job.id)}>
                                                    <Play className="w-3 h-3" />
                                                    Sync Now
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-destructive">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {job.lastError && (
                                        <div className="bg-destructive/5 border-t border-destructive/10 p-3 px-6 flex items-center gap-2 text-destructive text-[10px]">
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="font-medium">Last Error:</span> {job.lastError}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {syncs.length === 0 && !loadingSyncs && (
                            <Card className="border-dashed border-2 bg-muted/50">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                                    <div className="p-4 bg-background rounded-full shadow-sm">
                                        <RefreshCw className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <CardTitle>No Sync Jobs</CardTitle>
                                        <CardDescription>Define SQL queries to trigger bots automatically from your data.</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={() => setSjOpen(true)}>Create Your First Sync</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <CreateDataSourceDialog open={dsOpen} onOpenChange={setDsOpen} onSuccess={() => {}} />
            <CreateSyncJobDialog open={sjOpen} onOpenChange={setSjOpen} onSuccess={() => {}} dataSources={sources} />
        </div>
    );
}
