import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { APIResponse } from "@/types/api-response";
import type { WorkflowCategoryKey } from "@/types/constants";
import type { InputType } from "@/types/input-types";

type RoleT = {
  id: number;
  role_id: string;
  role_name: string;
};

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
  workflow_slug: string;
  workflow_name: string;
  module_level_slug: string;
  module_level_name: string;
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
  workflow_slug: string;
  workflow_name: string;
  module_level_slug: string;
  module_level_name: string;
  module_slug: string;
  module_name: string;
  position: number;
  editor_roles: RoleT[];
  form_fields: FieldsProps[];
}

export interface SectionProps {
  slug: string;
  name: string;
  description: string;
  position: number;
  approval_roles: RoleT[];
  is_active: boolean;
  workflow_slug: string;
  workflow_name: string;
  module_level_slug: string;
  module_level_name: string;
  module_slug: string;
  module_name: string;
  forms: FormProps[];
}

export interface WorkflowProps {
  slug: string;
  name: string;
  category: WorkflowCategoryKey;
  description: string;
  version: string;
  is_active: boolean;
  module_level: string;
  module_level_name: string;
  module_slug: string;
  module_name: string;
  sections_count: number;
  sections: SectionProps[];
}

interface DataProps extends APIResponse {
  results: WorkflowProps[];
}

export const workflowQueryKey = "workflow";

export const useWorkflowsQuery = (
  limit: number,
  offset: number,
  keyword: string,
  module: string,
  level: string,
  category: number | ""
) => {
  return useQuery<DataProps>({
    queryKey: [
      workflowQueryKey,
      { limit, offset, keyword, module, level, category },
    ],
    queryFn: () =>
      api
        .get(
          `/form-management/workflows/?limit=${limit}&offset=${offset}&keyword=${keyword}&module=${module}&module_level=${level}&category=${category}`
        )
        .then((res) => res.data),
  });
};

export const useWorkflowQuery = (workflow_slug: string) => {
  return useQuery<WorkflowProps>({
    queryKey: [workflowQueryKey, workflow_slug],
    queryFn: () =>
      api
        .get(`/form-management/submission/${workflow_slug}/`)
        .then((res) => res.data),
  });
};
