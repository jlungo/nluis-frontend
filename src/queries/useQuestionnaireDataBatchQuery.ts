import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { InputType } from "@/types/input-types"

export interface questionnaireDataBatchI {
  slug: string
  field_id: number
  form_slug: string
  value: string
  type: InputType
  is_approved: boolean
}

export const questionnaireDataBatchesQueryKey = "questionnaireDataBatch"

export const useQuestionnaireDataBatchQuery = (
  questionnaire_slug?: string,
  locality_project_id?: string
) => {
  return useQuery<questionnaireDataBatchI[]>({
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
