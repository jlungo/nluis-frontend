import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "national-land-use",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
