import Layout from "./layout";
import Page from "./page";
import Edit from "./edit";

const Index = {
  path: ":workflow_slug",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Edit,
  ],
};

export default Index;
