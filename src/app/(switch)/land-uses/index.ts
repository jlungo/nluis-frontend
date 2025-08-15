import Layout from "./layout";
import Page from "./page";
import DistrictLandUse from "./district-land-use/page";
import NationalLandUse from "./national-land-use/page";
import ZonalLandUse from "./zonal-land-use/page";
import RegionalLandUse from "./regional-land-use/page";
import VillageLandUse from "./village-land-use/page";
import LandUseDashboard from "./land-uses-dashboard/page";  
import LandUsesOverviewPage from "./land-uses-overview/page";


const Index = {
  path: "/land-uses",
  Component: Layout,
  children: [
    {
      path: "district-land-use",
      Component: DistrictLandUse
    },
    {
      path: "national-land-use",
      Component: NationalLandUse
    },
    {
      path: "zonal-land-use",
      Component: ZonalLandUse
    },
    {
      path: "regional-land-use",
      Component: RegionalLandUse
    },
    {
      path: "village-land-use",
      Component: VillageLandUse
    },
    {
      path: "land-uses-dashboard",
      Component: LandUseDashboard
    },
    {
      path: "land-uses-overview",
      Component: LandUsesOverviewPage
    },
    {
      index: true,
      Component: Page
    }
  ],
};

export default Index;
