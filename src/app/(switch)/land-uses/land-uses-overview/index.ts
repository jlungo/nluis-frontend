import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "land-uses-overview",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
