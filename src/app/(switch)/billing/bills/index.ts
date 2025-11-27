import Layout from "../layout";
import Page from "./page";
import BillDetailPage from "./BillDetailPage";

const Index = {
  path: "bills",
  Component: Layout,
  children: [
    {
      index: true,
      Component: Page,
    },
    {
      path: ":id",
      Component: BillDetailPage,
    },
  ],
};

export default Index;
