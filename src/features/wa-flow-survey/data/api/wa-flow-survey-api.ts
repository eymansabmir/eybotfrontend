import { apiClient } from "@/lib/api-client";

export interface WaFlowSurveyListItem {
  id: string;
  orgId: string;
  interaktFlowId: string;
  templateName: string | null;
  title: string | null;
  submissionCount: number;
  lastSubmittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaFlowQuestionAnalytics {
  questionKey: string;
  questionLabel: string;
  totalAnswers: number;
  options: Array<{ value: string; count: number }>;
}

export interface WaFlowSurveyAnalytics {
  survey: {
    id: string;
    orgId: string;
    interaktFlowId: string;
    templateName: string | null;
    title: string | null;
    submissionCount: number;
  };
  questions: WaFlowQuestionAnalytics[];
}

export interface WaFlowSubmissionListItem {
  id: string;
  waId: string;
  providerMessageId: string;
  templateName: string | null;
  callbackData: string | null;
  responseJson: Record<string, unknown>;
  submittedAt: string;
  createdAt: string;
}

export const waFlowSurveyApi = {
  list: async (orgId: string): Promise<{ surveys: WaFlowSurveyListItem[] }> => {
    const { data } = await apiClient.get<{ surveys: WaFlowSurveyListItem[] }>(
      `/wa-flow-surveys?orgId=${encodeURIComponent(orgId)}`,
    );
    return data;
  },

  analytics: async (orgId: string, surveyId: string): Promise<WaFlowSurveyAnalytics> => {
    const { data } = await apiClient.get<WaFlowSurveyAnalytics>(
      `/wa-flow-surveys/${encodeURIComponent(surveyId)}/analytics?orgId=${encodeURIComponent(orgId)}`,
    );
    return data;
  },

  submissions: async (
    orgId: string,
    surveyId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ submissions: WaFlowSubmissionListItem[]; total: number }> => {
    const params = new URLSearchParams({
      orgId,
      limit: String(limit),
      offset: String(offset),
    });
    const { data } = await apiClient.get<{ submissions: WaFlowSubmissionListItem[]; total: number }>(
      `/wa-flow-surveys/${encodeURIComponent(surveyId)}/submissions?${params.toString()}`,
    );
    return data;
  },
};
