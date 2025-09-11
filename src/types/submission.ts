type State = "0" | "1";

export type Submission = {
  name: string;
  description: string | null;
  module_level: string;
  version: string;
  category: number;
  sections: {
    slug?: string;
    name: string;
    description: string;
    position: number;
    approval_roles: { user_role: string }[];
    is_active?: State;
    forms: {
      slug?: string;
      name: string;
      description: string | null;
      position: number;
      editor_roles: { user_role: string }[];
      is_active?: State;
      form_fields: {
        id?: number;
        label: string;
        type: string;
        placeholder: string | null;
        name: string;
        required: boolean;
        position: number;
        is_active?: State;
        select_options: {
          text_label: string;
          value: string;
          position: number;
        }[];
      }[];
    }[];
  }[];
};

export const req = {
  name: "Region Land Use Planning Workflow",
  description: "Complete region land use planning workflow",
  module_level: "regional-land-use",
  category: 6,
  version: "1",
  sections: [
    {
      slug: "region-introduction-and-team-formation",
      name: "Region Introduction and Team Formation",
      description:
        "Introduce project to region and establish Region Land Use Management team",
      position: 1,
      approval_roles: [
        {
          user_role: "f6f69b2a-2bb2-4b20-87bf-5687b544dca1",
        },
        {
          user_role: "4d694f80-f03b-40ed-b963-5a7a777dfc17",
        },
      ],
      forms: [
        {
          slug: "region-introduction-form",
          name: "Region Introduction Form",
          description:
            "Present project to citizens and collect community response",
          position: 1,
          editor_roles: [
            {
              user_role: "6585c803-612a-4759-b9de-4445e0215ccd",
            },
            {
              user_role: "f6f69b2a-2bb2-4b20-87bf-5687b544dca1",
            },
          ],
          fields: [
            {
              id: 42,
              label: "Meeting Date",
              type: "date",
              placeholder: "Enter meeting date",
              name: "meeting-date",
              required: true,
              position: 1,
              select_options: [],
            },
            {
              id: 43,
              label: "Meeting Location",
              type: "text",
              placeholder: "Meeting location/venue",
              name: "meeting-location",
              required: true,
              position: 2,
              select_options: [],
            },
            {
              label: "New field",
              type: "text",
              placeholder: "Placeholder",
              name: "new-field",
              required: false,
              position: 3,
              select_options: [],
            },
          ],
        },
      ],
    },
    {
      slug: "team-assignment",
      name: "Team Assignment",
      description:
        "Assign implementation team and establish local partnerships",
      position: 1,
      approval_roles: [
        {
          user_role: "2cddc172-fac1-40a2-872e-2e6d2f1fb3d7",
        },
        {
          user_role: "f6f69b2a-2bb2-4b20-87bf-5687b544dca1",
        },
        {
          user_role: "4d694f80-f03b-40ed-b963-5a7a777dfc17",
        },
      ],
      forms: [
        {
          slug: "team-asignment-form",
          name: "Team Asignment Form",
          description: "Assign NLUPC implementation team and roles",
          position: 1,
          editor_roles: [
            {
              user_role: "f6f69b2a-2bb2-4b20-87bf-5687b544dca1",
            },
            {
              user_role: "4d694f80-f03b-40ed-b963-5a7a777dfc17",
            },
          ],
          fields: [
            {
              id: 29,
              label: "Team Leader",
              type: "members",
              placeholder: "Select team leader",
              name: "team-leader",
              required: true,
              position: 1,
              select_options: [],
            },
            {
              id: 30,
              label: "Team Members",
              type: "members",
              placeholder: "Select team members",
              name: "team-members",
              required: true,
              position: 2,
              select_options: [],
            },
          ],
        },
      ],
    },
    {
      name: "New Section",
      description: "Description",
      position: 1,
      approval_roles: [
        {
          user_role: "2cddc172-fac1-40a2-872e-2e6d2f1fb3d7",
        },
      ],
      forms: [
        {
          name: "New Form",
          description: "New form description",
          position: 1,
          editor_roles: [
            {
              user_role: "2cddc172-fac1-40a2-872e-2e6d2f1fb3d7",
            },
          ],
          fields: [
            {
              label: "New field",
              type: "text",
              placeholder: "Placeholder",
              name: "new-field",
              required: false,
              position: 1,
              select_options: [],
            },
          ],
        },
      ],
    },
  ],
};
