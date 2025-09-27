import FormWorkflows from "./form-workflows";
import Questionnaires from "./questionnaires";
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
    ModuleLevels,
  ],
};

export default Index;
