import Layout from "./layout";
import Page from "./page";

const Index = {
  path: "compliance_monitoring",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
