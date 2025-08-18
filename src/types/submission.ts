export type Submission = {
  name: string;
  description: string | null;
  module_level: string;
  version: string;
  category: string;
  sections: {
    name: string;
    description: string;
    position: number;
    forms: {
      name: string;
      description: string | null;
      fields: {
        label: string;
        type: string;
        placeholder: string | null;
        name: string;
        required: boolean;
        position: number;
      }[];
    }[];
  }[];
};
