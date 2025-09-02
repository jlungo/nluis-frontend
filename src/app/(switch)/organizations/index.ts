import Layout from "./layout";
import Page from "./dashboard/page";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "organizations",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    {
      path: "organizations-list",
      async lazy() {
        const { default: Component } = await import("./list/page");
        return { Component };
      }
    },
    {
      path: "organizations-list/registration",
      async lazy() {
        const { default: Component } = await import("./registration/page");
        return { Component };
      }
    },
   
    // {
    //   path: "projects",
    //   async lazy() {
    //     const { default: Component } = await import("./projects/page");
    //     return { Component };
    //   }
    // },
    {
      path: ":id",
      async lazy() {
        const { default: Component } = await import("./[id]/page");
        return { Component };
      }
    },
    {
      path: ":id/edit",
      async lazy() {
        const { default: Component } = await import("./[id]/edit/page");
        return { Component };
      }
    },
    
  ],
};

export default Index;
