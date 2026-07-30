import { Link, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  useWaFlowSurveyAnalytics,
  useWaFlowSurveySubmissions,
} from "../../data/queries/use-wa-flow-survey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function WaFlowSurveyDetailPage() {
  const { surveyId } = useParams({ strict: false }) as { surveyId?: string };
  const { data: session } = authClient.useSession();
  const orgId = (session?.user as any)?.organizationId || "68b08633907a113536238290";
  const id = surveyId ?? "";

  const { data: analytics, isLoading: analyticsLoading } = useWaFlowSurveyAnalytics(orgId, id);
  const { data: submissions, isLoading: submissionsLoading } = useWaFlowSurveySubmissions(
    orgId,
    id,
    50,
    0,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          to="/wa-flow-surveys"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="size-4" />
          All surveys
        </Link>
        {analyticsLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {analytics?.survey.title ||
                analytics?.survey.templateName ||
                analytics?.survey.interaktFlowId ||
                "Survey"}
            </h1>
            <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
              {analytics?.survey.templateName ? (
                <Badge variant="secondary">{analytics.survey.templateName}</Badge>
              ) : null}
              <span className="font-mono text-xs">Flow {analytics?.survey.interaktFlowId}</span>
              <span>{analytics?.survey.submissionCount ?? 0} submissions</span>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {analyticsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          : analytics?.questions.map((q) => {
              const max = Math.max(...q.options.map((o) => o.count), 1);
              return (
                <Card key={q.questionKey}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{q.questionLabel}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {q.totalAnswers} answers · {q.options.length} options
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {q.options.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No option values yet.</p>
                    ) : (
                      q.options.map((opt) => (
                        <div key={opt.value} className="space-y-1">
                          <div className="flex justify-between text-sm gap-2">
                            <span className="truncate">{opt.value}</span>
                            <span className="shrink-0 text-muted-foreground">{opt.count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/80"
                              style={{ width: `${Math.round((opt.count / max) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !submissions?.submissions?.length ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No submissions.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>WhatsApp ID</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Answers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.submissions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs">{row.waId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(row.submittedAt), "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-md truncate">
                      {Object.entries(row.responseJson || {})
                        .filter(([k]) => k !== "flow_token")
                        .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join("|") : String(v)}`)
                        .join("; ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
