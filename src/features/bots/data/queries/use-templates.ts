import { useQuery } from "@tanstack/react-query";
import { templatesApi } from "../api/templates-api";

export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
};

export function useTemplates() {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: templatesApi.getTemplates,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templatesApi.getTemplateById(id),
    enabled: !!id,
  });
}
