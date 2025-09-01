import Layout from "../layout";
import Page from "./page";
import Create from "./create";
import ProjectId from "./[project_id]";

const Index = {
  path: "regional-land-use",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Create,
    ProjectId,
  ],
};

export default Index;
