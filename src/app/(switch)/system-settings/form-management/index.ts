import FormWorkflows from "./form-workflows";
import Questionnaires from "./questionnaires";
import Reports from "./reports";
import ModuleLevels from "./module-levels";
import type { RouteObject } from "react-router";
import Page from "./page";

const Index: RouteObject = {
  path: "form-management",
  children: [
    {
      index: true,
      Component: Page,
    },
    FormWorkflows,
    Questionnaires,
    Reports,
    ModuleLevels,
  ],
};

export default Index;
