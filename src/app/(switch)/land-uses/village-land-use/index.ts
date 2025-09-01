import Layout from "../layout";
import Page from "./page";
import projectId from "./[project_id]";
import Create from "./create";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "village-land-use",
  Component: Layout,
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
