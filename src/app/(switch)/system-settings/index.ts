import Layout from "./layout";
import Page from "./page";
import FormWorkflows from "./form-workflows";
import UserManagement from "./user-management";
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
    UserManagement,
  ],
};

export default Index;
