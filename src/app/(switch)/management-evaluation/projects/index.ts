import Page from "./page";
import Create from "./create";
import projectId from "./[project_id]";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "projects",
  children: [
    {
      index: true,
      Component: Page,
    },
    Create,
    projectId
  ],
};

export default Index;
