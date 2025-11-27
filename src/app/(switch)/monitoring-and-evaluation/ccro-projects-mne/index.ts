import Layout from "./layout"
import Page from "./page"
import projectId from "./[project_id]"
import Create from "./create"

const Index = {
  path: "ccro-projects-mne",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Create,
    projectId,
  ],
}

export default Index
