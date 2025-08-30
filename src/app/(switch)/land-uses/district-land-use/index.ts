import Layout from "../layout";
import Page from "./page";

const Index = {
  path: "district-land-use",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    {
      path: ":id",
      async lazy() {
        const { default: Component } = await import("./[id]/page");
        return { Component };
      },
    },
    {
      path: ":id/edit",
      async lazy() {
        const { default: Component } = await import("./[id]/edit/page");
        return { Component };
      },
    },
  ],
};

export default Index;
