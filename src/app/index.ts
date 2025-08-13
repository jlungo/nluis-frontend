import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import Home from "./(index)";
import Auth from "./auth";
import SignIn from "./signin";
import Login from "./login";
import Board from "./board";
import Switch from "./(switch)";
import Shop from "./(shop)";

const Index = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [Home, Auth, SignIn, Login, Board, Switch, Shop],
  },
]);

export default Index;
