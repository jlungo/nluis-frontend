import Layout from "./layout";
import Dashboard from "./dashboard";
import LandUses from "./land-uses";
import CCROManagement from "./ccro-management";
import Compliance from "./compliance";
import ManagementEvaluation from "./management-evaluation";
import MapShopManagement from "./mapshop-management";
import Reports from "./reports";
import Organizations from "./organizations";
import UserManagement from "./user-management";
import SystemSettings from "./system-settings";
import AuditTrail from "./audit-trail";

const Index = {
  Component: Layout,
  lazy: async () => {
    const [Component] = await Promise.all([import("./layout")]);
    return { Component };
  },
  children: [
    Dashboard,
    LandUses,
    CCROManagement,
    Compliance,
    ManagementEvaluation,
    MapShopManagement,
    Reports,
    Organizations,
    UserManagement,
    SystemSettings,
    AuditTrail,
  ],
};

export default Index;
