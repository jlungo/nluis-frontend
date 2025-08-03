import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "/compliance",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
