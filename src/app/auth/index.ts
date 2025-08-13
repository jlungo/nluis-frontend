import Layout from "./layout";
import SignIn from "./signin";
import ForgotPassword from "./forgot-password";

const Index = {
  path: "auth",
  Component: Layout,
  children: [
    SignIn,
    ForgotPassword,
  ],
};

export default Index;
