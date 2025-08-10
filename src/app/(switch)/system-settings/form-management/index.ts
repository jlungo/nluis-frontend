// import Layout from "./layout";
import Page from "./page";
import Forms from "./forms";
import Builder from "./builder";
import Responses from "./responses";

const Index = {
  path: "form-management",
  //   Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Forms,
    Builder,
    Responses,
  ],
};

export default Index;
