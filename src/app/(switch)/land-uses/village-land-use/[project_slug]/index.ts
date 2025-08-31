import Layout from "./layout";
import Page from "./page";
import Workflow from "./workflow";

const Index = {
  path: ":project_slug",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Workflow,
  ],
};

export default Index;
