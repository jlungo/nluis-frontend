import Layout from "./layout";
import Page from "./page";

const Index = {
  path: ":questionnaire_id",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
  ],
};

export default Index;
