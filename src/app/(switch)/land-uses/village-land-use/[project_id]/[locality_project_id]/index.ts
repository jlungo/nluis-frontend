import Layout from "./layout";
import Page from "./page";
import Workflow from "./workflow";
import Questionnaire from "./questionnaire";

const Index = {
  path: ":locality_project_id",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Workflow,
    Questionnaire,
  ],
};

export default Index;
