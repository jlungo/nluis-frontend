import type { RouteObject } from "react-router";
import Layout from "./layout";
import Page from "./page";
import ProductDetailPage from "./ProductDetailPage";

const Index: RouteObject = {
  path: "/mapshop",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    {
      path: "products/:id",
      Component: ProductDetailPage,
    },
  ],
};

export default Index;
