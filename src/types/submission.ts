export type Submission = {
  name: string;
  description: string | null;
  module_level: string;
  version: string;
  category: number;
  sections: {
    name: string;
    description: string;
    position: number;
    approval_roles: string[];
    forms: {
      name: string;
      description: string | null;
      position: number;
      editor_roles: string[];
      fields: {
        label: string;
        type: string;
        placeholder: string | null;
        name: string;
        required: boolean;
        position: number;
        select_options: {
          text_label: string;
          value: string;
          position: number;
        }[];
      }[];
    }[];
  }[];
};
