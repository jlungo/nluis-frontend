import Layout from "./layout";
import FormWorkflows from "./form-workflows";
import WorkflowBuilder from "./workflow-builder";
import LevelSection from "./level-sections";
import ModuleLevels from "./module-levels";
import type { RouteObject } from "react-router";
import Page from "./page";

const Index: RouteObject = {
  path: "form-management",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    FormWorkflows,
    ModuleLevels,
    LevelSection,
    WorkflowBuilder,
  ],
};

export default Index;
