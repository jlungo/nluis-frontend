import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { InputType } from "@/types/input-types"

export interface questionnaireDataI {
  slug: string
  field_id: number
  form_slug: string
  value: string
  type: InputType
  is_approved: boolean
}

export const questionnaireDataQueryKey = "questionnaireData"

export const useQuestionnaireDataQuery = (
  questionnaire_slug?: string,
  locality_project_id?: string
) => {
  return useQuery<questionnaireDataI[]>({
    queryKey: [
      questionnaireDataQueryKey,
      { questionnaire_slug, locality_project_id },
    ],
    queryFn: () =>
      api
        .get(
          `/collect/questionnaire/data/?questionnaire_slug=${questionnaire_slug}&locality_project_id=${locality_project_id}`
        )
        .then((res) => res.data),
    enabled:
      questionnaire_slug !== undefined && locality_project_id !== undefined,
  })
}
