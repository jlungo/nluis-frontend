import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { APIResponse } from "@/types/api-response"

export interface QuestionnaireDataBatchI {
  id: string
  custom_form: number
  batch: number
}

export const questionnaireDataBatchesQueryKey = "questionnaireDataBatch"

export const useQuestionnaireDataBatchQuery = (
  questionnaire_slug?: string,
  locality_project_id?: string
) => {
  return useQuery<APIResponse<QuestionnaireDataBatchI>>({
    queryKey: [
      questionnaireDataBatchesQueryKey,
      { questionnaire_slug, locality_project_id },
    ],
    queryFn: () =>
      api
        .get(
          `/collect/questionnaire/batches/?questionnaire_slug=${questionnaire_slug}&locality_project_id=${locality_project_id}`
        )
        .then((res) => res.data),
    enabled:
      questionnaire_slug !== undefined && locality_project_id !== undefined,
  })
}
