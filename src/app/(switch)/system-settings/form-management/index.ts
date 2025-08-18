import Layout from "./layout";
import FormWorkflows from "./form-workflows";
import WorkflowBuilder from "./workflow-builder";
import LevelSection from "./level-sections";
import ModuleLevels from "./module-levels";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "form-management",
  Component: Layout,
  children: [FormWorkflows, ModuleLevels, LevelSection, WorkflowBuilder],
};

export default Index;
