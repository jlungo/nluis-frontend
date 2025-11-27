import Page from "./page";
import LocalityProjectId from "./[locality_project_id]";
import Edit from "./edit"

const Index = {
  path: ":project_id",
  children: [
    {
      index: true,
      Component: Page,
    },
    Edit,
    LocalityProjectId,
  ],
};

export default Index;
