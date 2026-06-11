import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphone, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/utils";

interface UserSession {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  isCurrent: boolean;
}

interface SessionPolicy {
  maxActiveSessions: number;
  idleTimeoutSec: number;
  absoluteTimeoutSec: number;
  blockSuspiciousConcurrent: boolean;
}

async function fetchSessionPolicy(): Promise<SessionPolicy> {
  const { data } = await apiClient.get<SessionPolicy>("/auth/session-policy");
  return data;
}

async function fetchActiveSessions(): Promise<UserSession[]> {
  const { data } = await apiClient.get<UserSession[]>("/user-sessions");
  return data;
}

function formatUserAgent(value?: string | null): string {
  if (!value) return "Unknown device";

  if (value.includes("Mobile")) return "Mobile browser";
  if (value.includes("Windows")) return "Windows browser";
  if (value.includes("Mac OS")) return "macOS browser";
  if (value.includes("Linux")) return "Linux browser";

  return "Web browser";
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

export function ActiveSessionsSettings() {
  const queryClient = useQueryClient();

  const policyQuery = useQuery({
    queryKey: ["auth", "session-policy"],
    queryFn: fetchSessionPolicy,
  });

  const sessionsQuery = useQuery({
    queryKey: ["auth", "active-sessions"],
    queryFn: fetchActiveSessions,
  });

  const revokeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await apiClient.delete(`/user-sessions/${sessionId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "active-sessions"] });
      toast.success("Session revoked");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to revoke session"));
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/user-sessions/revoke-others");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "active-sessions"] });
      toast.success("Signed out all other devices");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to sign out other devices"));
    },
  });

  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Session Security</CardTitle>
          <CardDescription>
            Only one active session is allowed per account. A new login signs out other devices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {policyQuery.isPending ? (
            <Spinner className="size-4" />
          ) : policyQuery.data ? (
            <>
              <p>Maximum active sessions per account: <strong>1</strong></p>
              <p>Idle timeout: <strong>{Math.round(policyQuery.data.idleTimeoutSec / 60)} minutes</strong></p>
              <p>Absolute session lifetime: <strong>{Math.round(policyQuery.data.absoluteTimeoutSec / 3600)} hours</strong></p>
              <p>
                Suspicious concurrent logins from new devices:
                {" "}
                <strong>{policyQuery.data.blockSuspiciousConcurrent ? "other sessions are revoked" : "logged only"}</strong>
              </p>
            </>
          ) : (
            <p>Session policy details are unavailable.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Review devices currently signed in and revoke access you do not recognize.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={revokeOthersMutation.isPending || sessions.filter((session) => !session.isCurrent).length === 0}
            onClick={() => revokeOthersMutation.mutate()}
          >
            Sign out other devices
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsQuery.isPending ? (
            <Spinner />
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-3 rounded-xl border border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <MonitorSmartphone className="size-4" />
                    {formatUserAgent(session.userAgent)}
                    {session.isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Current session
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    IP: {session.ipAddress || "Unknown"} · Started {formatTimestamp(session.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {formatTimestamp(session.expiresAt)}
                  </p>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={revokeMutation.isPending}
                    onClick={() => revokeMutation.mutate(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-muted-foreground">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          Sign-in uses email OTP (multi-factor authentication). Logging in on a new device or browser
          immediately invalidates any existing session.
        </p>
      </div>
    </div>
  );
}
