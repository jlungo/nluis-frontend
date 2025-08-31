import Layout from "../layout";
import Page from "./page";
import projectId from "./[id]";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "village-land-use",
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
      path: ":id",
      async lazy() {
        const { default: Component } = await import("./[id]/page");
        return { Component };
      },
    },
    projectId
  ],
};

export default Index;
