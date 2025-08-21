import Layout from "./layout";
import Page from "./page";
import DistrictLandUse from "./district-land-use";
import NationalLandUse from "./national-land-use";
import ZonalLandUse from "./zonal-land-use";
import RegionalLandUse from "./regional-land-use";
import VillageLandUse from "./village-land-use";
import LandUseDashboard from "./land-uses-dashboard";
import LandUsesOverviewPage from "./land-uses-overview";
import CreateProject from "./create-project";

const Index = {
  path: "/land-uses",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    DistrictLandUse,
    NationalLandUse,
    ZonalLandUse,
    RegionalLandUse,
    VillageLandUse,
    LandUseDashboard,
    LandUsesOverviewPage,
    CreateProject,
  ],
};

export default Index;
