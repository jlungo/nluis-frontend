import Layout from "./layout";
import Page from "./page";
import Mapshop from "./mapshop";

const Index = {
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Mapshop,
  ],
};

export default Index;
