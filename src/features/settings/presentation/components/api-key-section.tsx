import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Key, 
  Copy, 
  Trash2, 
  Plus, 
  Eye, 
  Terminal, 
  Code2, 
  Check,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

interface ApiKey {
  id: string;
  name: string;
  appId: string;
  isActive: boolean;
  createdAt: string;
}

interface NewKeyResult extends ApiKey {
  appSecret: string;
}

export function ApiKeySection() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<NewKeyResult | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await apiClient.get("/settings/keys");
      setKeys(res.data);
    } catch (error: any) {
      console.error("[ApiKeySection] Fetch error:", error);
      toast.error(error.message || "Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await apiClient.post("/settings/keys", { name: newKeyName });
      const data = res.data;
      setCreatedKey(data);
      setKeys([data, ...keys]);
      setNewKeyName("");
      setIsCreating(false);
      toast.success("Credentials generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to create credentials");
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await apiClient.delete(`/settings/keys/${id}`);
      setKeys(keys.filter(k => k.id !== id));
      toast.success("Credentials revoked");
    } catch (error: any) {
      toast.error(error.message || "Failed to revoke credentials");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyingId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopyingId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6 text-primary" />
            API Credentials
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage App ID and Secret for secure Machine-to-Machine integrations.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="rounded-xl px-6">
          <Plus className="size-4 mr-2" />
          Create New Credentials
        </Button>
      </div>

      {/* Creation UI */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-2xl bg-muted/30 border border-muted/50 backdrop-blur-sm"
          >
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Credential Name</label>
                <Input 
                  placeholder="e.g., Daily CRM Sync" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-11 bg-background border-muted/50 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsCreating(false)} className="h-11 rounded-xl">Cancel</Button>
                <Button onClick={handleCreate} disabled={!newKeyName.trim()} className="h-11 rounded-xl px-8">Generate</Button>
              </div>
            </div>
          </motion.div>
        )}

        {createdKey && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-3xl bg-primary/[0.03] border-2 border-primary/20 shadow-2xl shadow-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
               <Button variant="ghost" size="sm" onClick={() => setCreatedKey(null)} className="rounded-full h-8 w-8 p-0">×</Button>
            </div>
            
            <div className="flex items-start gap-6 mb-8">
              <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Key className="size-7 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">One-Time Credential Display</h3>
                <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
                  Your new API credentials are ready. For security reasons, we will <strong>only show the secret once</strong>. Please copy it to a secure location (like a vault) now.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">App ID</label>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-background border rounded-xl flex items-center px-4 font-mono text-sm font-bold shadow-inner">
                    {createdKey.appId}
                  </div>
                  <Button variant="secondary" onClick={() => copyToClipboard(createdKey.appId, 'appId')} className="h-12 w-12 rounded-xl p-0">
                    {copyingId === 'appId' ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">App Secret</label>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 bg-background border-primary/30 border-2 rounded-xl flex items-center px-4 font-mono text-sm font-bold shadow-inner relative overflow-hidden">
                    {!showSecret && <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center">
                       <Button variant="ghost" size="sm" onClick={() => setShowSecret(true)} className="text-[10px] font-bold tracking-widest uppercase">
                          <Eye className="size-3 mr-2" /> Click to Reveal
                       </Button>
                    </div>}
                    {createdKey.appSecret}
                  </div>
                  <Button variant="default" onClick={() => copyToClipboard(createdKey.appSecret, 'appSecret')} className="h-12 w-12 rounded-xl p-0 shadow-lg shadow-primary/20">
                    {copyingId === 'appSecret' ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-center">
              <AlertTriangle className="size-5 text-amber-500 shrink-0" />
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-tight">
                Once you close this panel, the App Secret will be hashed and hidden forever.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
           <Terminal className="size-4 text-muted-foreground" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Application Identifiers</span>
        </div>

        <div className="rounded-3xl border bg-card/50 shadow-sm overflow-hidden ring-1 ring-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Identifier Name</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">App ID</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Created</th>
                <th className="px-6 py-4 text-left font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-right font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                    Loading credentials...
                  </td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Code2 className="size-8" />
                      <p className="text-xs font-bold uppercase tracking-widest">No Credentials Found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4 font-bold text-foreground/90">{key.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded-lg font-mono opacity-80">{key.appId}</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(key.appId, key.id)}
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copyingId === key.id ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="h-5 text-[9px] font-bold bg-green-500/5 text-green-600 border-green-500/20 uppercase">
                         Active
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRevoke(key.id)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl h-9 w-9 p-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Docs Footer */}
      <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 flex gap-6 items-start">
        <div className="size-10 rounded-xl bg-background border flex items-center justify-center shrink-0 shadow-sm">
           <Info className="size-5 text-muted-foreground" />
        </div>
        <div className="space-y-1">
           <h4 className="text-sm font-bold tracking-tight text-foreground">Developer Documentation</h4>
           <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
             Use these credentials to authenticate your API requests. Our API follows the OAuth2 Client Credentials flow. 
             Exchange your App ID and Secret for a Bearer token at the <code className="bg-muted px-1 rounded">/api/v1/auth/token</code> endpoint.
           </p>
        </div>
      </div>
    </div>
  );
}
