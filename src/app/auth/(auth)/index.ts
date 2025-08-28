import Layout from "./layout";
import Signin from "./signin";
import Signup from "./signup";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  Component: Layout,
  children: [Signin, Signup],
};

export default Index;
