import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "mapshop",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
