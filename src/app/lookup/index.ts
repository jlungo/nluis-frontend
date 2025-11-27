import type { RouteObject } from "react-router";
import Page from "./page";
import Verify from "./verify";
import Results from "./results";

const Index: RouteObject = {
  path: "/lookup",
  children: [
    {
      index: true,
      Component: Page,
    },
    Verify,
    Results,
  ],
};

export default Index;
