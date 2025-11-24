import Layout from "./layout"
import Page from "./page"
import Batch from "./[batch]"

const Index = {
  path: ":questionnaire_id",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Batch,
  ],
}

export default Index
