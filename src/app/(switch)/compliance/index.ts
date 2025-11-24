import Layout from "./layout"
import Page from "./page"
import LandUses from "./land-uses"
import CCROProjectsCompliance from "./ccro-projects-compliance"

const Index = {
  path: "/compliance",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    LandUses,
    CCROProjectsCompliance,
  ],
}

export default Index
