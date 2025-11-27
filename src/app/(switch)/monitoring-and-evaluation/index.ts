import Layout from "./layout"
import Page from "./page"
import LandUses from "./land-uses"
import CCROProjectsMNE from "./ccro-projects-mne"

const Index = {
  path: "/monitoring-and-evaluation",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    LandUses,
    CCROProjectsMNE,
  ],
}

export default Index
