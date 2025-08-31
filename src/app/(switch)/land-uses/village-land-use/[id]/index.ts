import Page from "./page";
import projectId from "./[locality_project_slug]";
import Edit from "./edit"

const Index = {
  path: ":project_slug",
  children: [
    {
      index: true,
      Component: Page,
    },
    Edit,
    projectId,
  ],
};

export default Index;
