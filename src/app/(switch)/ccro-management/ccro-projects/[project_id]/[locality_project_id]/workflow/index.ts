import Layout from "./layout"
import Page from "./page"
import Batch from "./[batch]"

const Index = {
  path: "workflow",
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
