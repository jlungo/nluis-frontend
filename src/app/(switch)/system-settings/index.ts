import Layout from "./layout";
import Page from "./page";
import FormManagement from "./form-management";
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
    FormManagement,
    UserManagement,
  ],
};

export default Index;
