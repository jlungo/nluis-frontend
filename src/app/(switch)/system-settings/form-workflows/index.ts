import Layout from "./layout";
import Page from "./page";
import WorkflowSlugPage from "./[workflow_slug]";
import WorkflowBuilder from "./workflow-builder";
import ModuleLevels from "./module-levels";

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
    ModuleLevels,
  ],
};

export default Index;
