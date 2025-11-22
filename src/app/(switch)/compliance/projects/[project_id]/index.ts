import type { RouteObject } from "react-router";
import Page from "./page";

const projectId: RouteObject = {
  path: ":project_id",
  Component: Page,
};

export default projectId;
