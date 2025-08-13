import Layout from "./layout";
import Page from "./page";
import FormManagement from "./form-management";

const Index = {
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
