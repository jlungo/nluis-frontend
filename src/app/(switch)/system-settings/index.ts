import Layout from "./layout";
import Page from "./page";
import FormWorkflows from "./form-workflows";
import ModuleLevels from "./module-levels";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "/system-settings",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    FormWorkflows,
    ModuleLevels,
  ],
};

export default Index;
