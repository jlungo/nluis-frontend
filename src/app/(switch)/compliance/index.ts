import Layout from "./layout";
import Page from "./page";
import Projects from "./projects";

const Index = {
  path: "/compliance",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Projects,
  ],
};

export default Index;
