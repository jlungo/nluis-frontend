import Layout from "./layout"
import Page from "./page"
import LandUses from "./land-uses"

const Index = {
  path: "/compliance",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    LandUses,
  ],
}

export default Index
