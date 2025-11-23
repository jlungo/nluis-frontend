import React from "react";
import Layout from "./layout";
import MneProjects from "./mne-projects";
import { Navigate } from "react-router";

const Index = {
  path: "/monitoring-and-evaluation",
  Component: Layout,
  children: [
    {
      index: true,
      element: React.createElement(Navigate, { to: "mne-projects", replace: true }),
    },
    {
      path: "mne-projects",
      Component: MneProjects.Component,
      children: MneProjects.children,
    },
  ],
};

export default Index;
