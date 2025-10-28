
import Page from "./page";
import DetailPage from "./[id]/page";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "ccro-application",
  children: [
    {
      index: true,
      Component: Page,
    },
    {
      path: ":id",
      Component: DetailPage,
    },
    {
      path: ":id/edit",
      Component: DetailPage, // You can create a separate EditPage component if needed
    }
  ],
};

export default Index;
