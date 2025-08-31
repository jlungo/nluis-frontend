import Layout from "../layout";
import Page from "./page";
import ProjectSlug from "./[project_slug]";
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
        const { default: Component } = await import("./[project_slug]/page");
        return { Component };
      },
    },
    ProjectSlug
  ],
};

export default Index;
