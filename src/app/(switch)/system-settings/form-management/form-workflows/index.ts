import Layout from "./layout";
import Page from "./page";
import WorkflowSlugPage from "./[workflow_slug]";
import WorkflowBuilder from "./workflow-builder";

const Index = {
  path: "form-workflows",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    WorkflowSlugPage,
    WorkflowBuilder,
  ],
};

export default Index;
