import Layout from "./layout"
import Page from "./page"
import DistrictLandUse from "./district-land-use-compliance"
import NationalLandUse from "./national-land-use-compliance"
import ZonalLandUse from "./zonal-land-use-compliance"
import RegionalLandUse from "./regional-land-use-compliance"
import VillageLandUse from "./village-land-use-compliance"

const Index = {
  path: "land-uses",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    NationalLandUse,
    ZonalLandUse,
    RegionalLandUse,
    DistrictLandUse,
    VillageLandUse,
  ],
}

export default Index
