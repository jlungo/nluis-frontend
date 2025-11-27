import type { RouteObject } from "react-router";
import Page from "./page";
import TemplateBuilder from "./template-builder";

const Index: RouteObject = {
  path: "reports",
  children: [
    {
      index: true,
      Component: Page,
    },
    TemplateBuilder,
  ],
};

export default Index;
