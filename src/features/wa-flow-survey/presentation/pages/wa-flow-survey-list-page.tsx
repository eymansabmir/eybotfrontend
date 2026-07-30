import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ClipboardList, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useWaFlowSurveys } from "../../data/queries/use-wa-flow-survey";
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

export function WaFlowSurveyListPage() {
  const { data: session } = authClient.useSession();
  const orgId = (session?.user as any)?.organizationId || "68b08633907a113536238290";
  const { data, isLoading } = useWaFlowSurveys(orgId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Flow Surveys</h1>
        <p className="text-muted-foreground text-sm mt-1">
          WhatsApp Flow (Meta) submissions collected via Interakt — question-level KPIs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="size-4" />
            Surveys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !data?.surveys?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No flow submissions yet. Submit a WhatsApp Flow template to see results here.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Survey</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Flow ID</TableHead>
                  <TableHead className="text-right">Submissions</TableHead>
                  <TableHead>Last submitted</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">
                      {survey.title || survey.templateName || survey.interaktFlowId}
                    </TableCell>
                    <TableCell>
                      {survey.templateName ? (
                        <Badge variant="secondary">{survey.templateName}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {survey.interaktFlowId}
                    </TableCell>
                    <TableCell className="text-right">{survey.submissionCount}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {survey.lastSubmittedAt
                        ? format(new Date(survey.lastSubmittedAt), "dd MMM yyyy HH:mm")
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to="/wa-flow-surveys/$surveyId"
                        params={{ surveyId: survey.id }}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View KPIs
                        <ChevronRight className="size-4" />
                      </Link>
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
