import { useQuery } from "@tanstack/react-query";
import { waFlowSurveyApi } from "../api/wa-flow-survey-api";

export const waFlowSurveyKeys = {
  all: ["wa-flow-surveys"] as const,
  list: (orgId: string) => [...waFlowSurveyKeys.all, "list", orgId] as const,
  analytics: (orgId: string, surveyId: string) =>
    [...waFlowSurveyKeys.all, "analytics", orgId, surveyId] as const,
  submissions: (orgId: string, surveyId: string, limit: number, offset: number) =>
    [...waFlowSurveyKeys.all, "submissions", orgId, surveyId, limit, offset] as const,
};

type PollOptions = {
  refetchInterval?: number | false;
};

export function useWaFlowSurveys(orgId: string, options?: PollOptions) {
  return useQuery({
    queryKey: waFlowSurveyKeys.list(orgId),
    queryFn: () => waFlowSurveyApi.list(orgId),
    enabled: Boolean(orgId),
    refetchInterval: options?.refetchInterval,
  });
}

export function useWaFlowSurveyAnalytics(
  orgId: string,
  surveyId: string,
  options?: PollOptions,
) {
  return useQuery({
    queryKey: waFlowSurveyKeys.analytics(orgId, surveyId),
    queryFn: () => waFlowSurveyApi.analytics(orgId, surveyId),
    enabled: Boolean(orgId && surveyId),
    refetchInterval: options?.refetchInterval,
  });
}

export function useWaFlowSurveySubmissions(
  orgId: string,
  surveyId: string,
  limit = 50,
  offset = 0,
) {
  return useQuery({
    queryKey: waFlowSurveyKeys.submissions(orgId, surveyId, limit, offset),
    queryFn: () => waFlowSurveyApi.submissions(orgId, surveyId, limit, offset),
    enabled: Boolean(orgId && surveyId),
  });
}
