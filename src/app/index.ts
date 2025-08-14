import { createBrowserRouter, type RouteObject } from "react-router";
import Layout from "./layout";
import Home from "./(index)";
import Signin from "./signin";
import Login from "./login";
import Board from "./board";
import Switch from "./(switch)";
import Shop from "./(shop)";

// Helper function to convert route configs with boolean index to proper RouteObject
function convertToRouteObject(route: any): RouteObject {
  const { children, index, ...rest } = route;
  return {
    ...rest,
    index: index === true ? true : undefined,
    children: children?.map(convertToRouteObject)
  };
}

const routeConfigs = [
  {
    path: "/",
    Component: Layout,
    children: [
      { ...Home },
      { ...Signin },
      { ...Login },
      { ...Board },
      { ...Switch },
      { ...Shop }
    ]
  }
];

const routes = routeConfigs.map(convertToRouteObject);
const Index = createBrowserRouter(routes);

export default Index;
