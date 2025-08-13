import Layout from "./layout";
import SignIn from "./signin";
import ForgotPassword from "./forgot-password";
import ResetPassword from "./reset-password";

const Index = {
  path: "auth",
  Component: Layout,
  children: [
    SignIn,
    ForgotPassword,
    ResetPassword,
  ],
};

export default Index;
