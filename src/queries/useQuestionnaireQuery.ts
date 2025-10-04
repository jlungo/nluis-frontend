import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";
import type { QuestionnaireCategoryKey } from "@/types/constants";
import type { InputType } from "@/types/input-types";

export interface SelectOptionProps {
  text_label: string;
  value: string;
  position: number;
}

export interface FieldsProps {
  id: 0;
  label: string;
  type: InputType;
  type_display: string;
  placeholder: string;
  name: string;
  required: boolean;
  position: number;
  is_active: boolean;
  form_slug: string;
  form_name: string;
  section_slug: string;
  section_name: string;
  questionnaire_slug: string;
  questionnaire_name: string;
  module_slug: string;
  module_name: string;
  select_options: SelectOptionProps[];
}

export interface FormProps {
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  section_slug: string;
  section_name: string;
  questionnaire_slug: string;
  questionnaire_name: string;
  module_slug: string;
  module_name: string;
  position: number;
  form_fields: FieldsProps[];
}

export interface SectionProps {
  slug: string;
  name: string;
  description: string;
  position: number;
  is_active: boolean;
  questionnaire_slug: string;
  questionnaire_name: string;
  module_slug: string;
  module_name: string;
  forms: FormProps[];
}

export interface QuestionnaireProps {
  slug: string;
  name: string;
  category: QuestionnaireCategoryKey;
  description: string;
  version: string;
  is_active: boolean;
  module_slug: string;
  module_name: string;
  sections_count: number;
  sections: SectionProps[];
}

interface DataProps extends APIResponse {
  results: QuestionnaireProps[];
}

export const questionnaireQueryKey = "questionnaire";

export const useQuestionnairesQuery = (
  limit: number,
  offset: number,
  keyword: string,
  module: string,
  level: string,
  category: number | ""
) => {
  return useQuery<DataProps>({
    queryKey: [
      questionnaireQueryKey,
      { limit, offset, keyword, module, level, category },
    ],
    queryFn: () =>
      api
        .get(
          `/questionnaire/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}&category=${category}`
        )
        .then((res) => res.data),
  });
};

export const useQuestionnaireQuery = (questionnaire_slug: string) => {
  return useQuery<QuestionnaireProps>({
    queryKey: [questionnaireQueryKey, questionnaire_slug],
    queryFn: () =>
      api.get(`/questionnaire/${questionnaire_slug}/`).then((res) => res.data),
  });
};
