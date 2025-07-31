import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import Home from "./(index)";
import Auth from "./(auth)";
import Board from "./board";
import Switch from "./(switch)";

const Index = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [Home, Auth, Board, Switch],
  },
]);

export default Index;
