import Layout from "../layout";
import Page from "./page";

const Index = {
  path: "national-land-use",
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
    {
      path: ":project_id/edit",
      async lazy() {
        const { default: Component } = await import("./[project_id]/edit/page");
        return { Component };
      },
    },
  ],
};

export default Index;
