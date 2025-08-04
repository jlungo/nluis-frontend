import Layout from "./layout";
import Signup from "./signup";
import Login from "./login";

const Index = {
  path: "/auth",
  Component: Layout,
  children: [Signup, Login],
};

export default Index;
