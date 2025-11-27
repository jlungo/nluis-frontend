import Layout from "./layout";
import Page from "./page";
import Sales from "./sales";
import BillingManagement from "./billing-management";
import Bills from "./bills";
import Payments from "./payments";
import Receipts from "./receipts";
import Orders from "./orders";
import BillingReports from "./billing-reports";
import BillingConfigurations from "./configurations";

const Index = {
  path: "/billing",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    Sales,
    BillingManagement,
    Bills,
    Payments,
    Receipts,
    Orders,
    BillingReports,
    BillingConfigurations,
  ],
};

export default Index;
