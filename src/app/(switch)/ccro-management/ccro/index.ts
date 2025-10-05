
import Page from "./page";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "ccro",

  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
