import Layout from "./layout";
import FormDashboard from "./forms-dashboard";
import FormBuilder from "./form-builder";
import LevelSection from "./level-sections";
import ModuleLevels from "./module-levels";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "form-management",
  Component: Layout,
  children: [FormDashboard, ModuleLevels, LevelSection, FormBuilder],
};

export default Index;
