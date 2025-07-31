import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "land_use_planning",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
