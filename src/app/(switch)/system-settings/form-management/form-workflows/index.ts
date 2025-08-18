import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "form-workflows",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
