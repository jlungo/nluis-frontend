import Layout from "./layout";
import Dashboard from "./dashboard";
import LandUsePlanning from "./land-use-planning";
import CCROManagement from "./ccro-management";
import Compliance from "./compliance-monitoring";

const Index = {
  Component: Layout,
  children: [Dashboard, LandUsePlanning, CCROManagement, Compliance],
};

export default Index;
