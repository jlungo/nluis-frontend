import Page from "./page";
import CcroProjects from "./ccro-projects";
import CcroPage from "./ccro";
import LandFormalizationPage from "./land-formalization";
import ReportsPage from "./reports";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "/ccro-management",
  children: [
    {
      index: true,
      Component: Page,
    },
    CcroPage,
    CcroProjects,
    LandFormalizationPage,
    ReportsPage,
  ],
};

export default Index;
