import Layout from "../layout";
import FeesPage from "./fees/page";

const Index = {
  path: "configurations",
  Component: Layout,
  children: [
    {
      path: "fees",
      Component: FeesPage,
    },
  ],
};

export default Index;
