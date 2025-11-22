import Layout from "./layout"
import Workflow from "./workflow"

const Index = {
  path: ":locality_project_id",
  Component: Layout,
  children: [Workflow],
}

export default Index
