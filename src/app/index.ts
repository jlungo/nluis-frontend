import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import Home from "./(index)";
import Auth from "./auth";
import Board from "./board";
import Switch from "./(switch)";
import Shop from "./(shop)";
import Me from "./me";

const Index = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [Home, Auth, Board, Switch, Shop, Me],
  },
]);

export default Index;
