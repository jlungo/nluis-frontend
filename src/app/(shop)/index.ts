import Layout from "./layout";
import MapShop from "./mapshop";
import Portal from "./portal";

const Index = {
  Component: Layout,
  children: [MapShop, Portal],
};

export default Index;
