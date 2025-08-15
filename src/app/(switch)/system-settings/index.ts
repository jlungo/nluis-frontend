import Layout from "./layout";
import Page from "./page";
import FormManagement from "./form-management";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "/system-settings",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    FormManagement,
  ],
};

export default Index;
