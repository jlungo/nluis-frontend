import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "setups-currency",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
