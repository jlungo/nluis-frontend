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
  id: number;
  label: string;
  type: InputType;
  type_display: string;
  placeholder: string;
  name: string;
  required: boolean;
  position: number;
  is_active: boolean;
  custom_form_slug: string;
  custom_form_name: string;
  questionnaire_section_slug: string;
  questionnaire_section_name: string;
  questionnaire_slug: string;
  questionnaire_name: string;
  module_slug: string;
  module_name: string;
  questionnaire_select_options: SelectOptionProps[];
}

export interface FormProps {
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  questionnaire_section_slug: string;
  questionnaire_section_name: string;
  questionnaire_slug: string;
  questionnaire_name: string;
  module_slug: string;
  module_name: string;
  position: number;
  custom_form_fields: FieldsProps[];
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
  questionnaire_section_forms: FormProps[];
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
  questionnaire_sections_count: number;
  questionnaire_sections: SectionProps[];
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
          `/collect/questionnaire/list/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}&category=${category}`
        )
        .then((res) => res.data),
  });
};

export const useQuestionnaireQuery = (questionnaire_slug: string) => {
  return useQuery<QuestionnaireProps>({
    queryKey: [questionnaireQueryKey, questionnaire_slug],
    queryFn: () =>
      api
        .get(`/collect/questionnaire/${questionnaire_slug}/`)
        .then((res) => res.data),
  });
};
