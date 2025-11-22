import Layout from "./layout"
import Page from "./page"
import DistrictLandUse from "./district-land-use-mne"
import NationalLandUse from "./national-land-use-mne"
import ZonalLandUse from "./zonal-land-use-mne"
import RegionalLandUse from "./regional-land-use-mne"
import VillageLandUse from "./village-land-use-mne"

const Index = {
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
