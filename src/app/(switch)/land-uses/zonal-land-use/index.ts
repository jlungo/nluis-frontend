import Layout from "../layout";
import Page from "./page";
import projectId from "./[project_id]";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "zonal-land-use",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    {
      path: "create",
      async lazy() {
        const { default: Component } = await import("./create/page");
        return { Component };
      },
    },
    {
      path: ":project_id",
      async lazy() {
        const { default: Component } = await import("./[project_id]/page");
        return { Component };
      },
    },
    projectId
  ],
};

export default Index;
