import Layout from "./layout";
import Dashboard from "./dashboard";
import LandUsePlanning from "./land_use_planning";
import CCROManagement from "./ccro_management";
import Compliance from "./compliance_monitoring";

const Index = {
  Component: Layout,
  children: [Dashboard, LandUsePlanning, CCROManagement, Compliance],
};

export default Index;
