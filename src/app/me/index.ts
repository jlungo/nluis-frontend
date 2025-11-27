import SwitchLayout from "../(switch)/layout";
import DashboardPage from "./dashboard/page";
import MyBillsPage from "./my-bills/page";
import MyOrdersPage from "./my-orders/page";
import MyProductsPage from "./downloads/page";

const Index = {
  path: "/me",
  Component: SwitchLayout,
  children: [
    {
      index: true,
      Component: DashboardPage,
    },
    {
      path: "dashboard",
      Component: DashboardPage,
    },
    {
      path: "bills",
      Component: MyBillsPage,
    },
    {
      path: "orders",
      Component: MyOrdersPage,
    },
    {
      path: "downloads",
      Component: MyProductsPage,
    },
  ],
};

export default Index;
