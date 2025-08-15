import Layout from "./layout";
import Page from "./page";
import BrowseMaps from "./browse-maps";
import MyMaps from "./my-maps";
import AccountSettings from "./account-settings";
import type { RouteObject } from "react-router";

const Index: RouteObject = {
  path: "/portal",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    BrowseMaps,
    MyMaps,
    AccountSettings,
  ],
};

export default Index;
