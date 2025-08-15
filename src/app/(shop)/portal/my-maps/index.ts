import type { RouteObject } from "react-router";
import Layout from "./layout";
import Page from "./page";

const Index: RouteObject = {
  path: "my-maps",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
