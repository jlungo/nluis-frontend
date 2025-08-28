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
    approval_roles: { user_role: string }[];
    forms: {
      name: string;
      description: string | null;
      position: number;
      editor_roles: { user_role: string }[];
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

export const workflowData: Submission = {
  name: "string",
  description: "string",
  module_level: "string",
  category: 1,
  version: "string",
  sections: [
    {
      name: "string",
      description: "string",
      position: 1,
      approval_roles: [
        {
          user_role: "d258f5ce-af48-4892-89a2-89d5563c5fd9",
        },
      ],
      forms: [
        {
          name: "string",
          description: "string",
          position: 1,
          editor_roles: [
            {
              user_role: "d258f5ce-af48-4892-89a2-89d5563c5fd9",
            },
          ],
          fields: [
            {
              label: "string",
              type: "string",
              placeholder: "string",
              name: "string",
              required: true,
              position: 1,
              select_options: [
                {
                  text_label: "string",
                  value: "name",
                  position: 1,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
