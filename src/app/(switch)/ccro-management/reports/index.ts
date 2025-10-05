import Layout from "../layout";
import Page from "./page";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "reports",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
