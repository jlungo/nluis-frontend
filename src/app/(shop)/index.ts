import type { RouteObject } from "react-router";
import Layout from "./layout";
import MapShop from "./mapshop";
import Portal from "./portal";

const Index: RouteObject = {
  Component: Layout,
  children: [MapShop, Portal],
};

export default Index;
