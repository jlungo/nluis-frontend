import Layout from "./layout"
import Workflow from "./workflow"
import Questionnaire from "./questionnaire"

const Index = {
  path: ":locality_project_id",
  Component: Layout,
  children: [Workflow, Questionnaire],
}

export default Index
