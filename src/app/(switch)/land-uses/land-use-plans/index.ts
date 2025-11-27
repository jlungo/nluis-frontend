import Layout from "../layout";
import type { RouteObject } from "react-router";
import Page from "./page";
import PlanId from "./[plan_id]";

const Index: RouteObject = {
  path: "land-use-plans",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    PlanId,
  ],
};

export default Index;
