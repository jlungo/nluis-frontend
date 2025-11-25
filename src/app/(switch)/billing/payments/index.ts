import Layout from "../layout";
import Page from "./page";

const Index = {
  path: "payments",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
