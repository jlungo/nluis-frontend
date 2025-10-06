import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import Home from "./(index)";
import Auth from "./auth";
import Board from "./board";
import Switch from "./(switch)";
import Shop from "./(shop)";
import Lookup from "./lookup";
import LookupVerify from "./lookup/verify";
import LookupResults from "./lookup/results";

const Index = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      Home,
      Auth,
      Board,
      Switch,
      Shop,
      {
        path: "lookup",
        Component: Lookup,
      },
      {
        path: "lookup/verify",
        Component: LookupVerify,
      },
      {
        path: "lookup/results",
        Component: LookupResults,
      }
    ],
  },
]);

export default Index;
