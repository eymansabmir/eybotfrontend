import { useCredentials, useDeleteCredential, useRevokeCredential } from "@/features/integrations/hooks/use-credentials";
import { DEFAULT_ORG_ID } from "@/features/integrations/openai/domain/openai.constants";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2Icon, RefreshCwIcon, PlusIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Link } from "@tanstack/react-router";

import { ProviderLogo } from "@/components/brand-logos";

export function CredentialsSettings() {
  const { data: credentials, isLoading } = useCredentials(DEFAULT_ORG_ID);
  const deleteMutation = useDeleteCredential(DEFAULT_ORG_ID);
  const revokeMutation = useRevokeCredential(DEFAULT_ORG_ID);

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Credentials</h2>
          <p className="text-muted-foreground text-sm">
            Securely manage your third-party integration keys.
          </p>
        </div>
        <Button size="sm" asChild className="rounded-xl px-5 font-bold shadow-lg shadow-primary/20">
          <Link to="/settings/credentials/create">
            <PlusIcon className="mr-2 size-4" />
            Add Credential
          </Link>
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-muted/50 rounded-3xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-muted/30">
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Provider</TableHead>
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</TableHead>
              <TableHead className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Connected On</TableHead>
              <TableHead className="py-5 px-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {credentials?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                  No active credentials found.
                </TableCell>
              </TableRow>
            ) : (
              credentials?.map((cred) => (
                <TableRow key={cred.id} className="group hover:bg-muted/30 transition-colors border-muted/20">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <ProviderLogo type={cred.type} className="size-6" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm truncate">{cred.name}</span>
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{cred.type.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {cred.isActive ? (
                      <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-tighter">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50">
                        <div className="size-1.5 rounded-full bg-muted-foreground" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-muted-foreground text-xs font-medium">
                    {format(new Date(cred.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-9 w-9"
                        title="Sync / Revoke"
                        onClick={() => revokeMutation.mutate(cred.id)}
                        disabled={revokeMutation.isPending}
                      >
                        <RefreshCwIcon className="size-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg h-9 w-9"
                        title="Delete"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this credential?")) {
                            deleteMutation.mutate(cred.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
