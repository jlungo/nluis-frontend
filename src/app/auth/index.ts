import Layout from "./layout";
import SignIn from "./signin";
import ForgotPassword from "./forgot-password";
import ResetPassword from "./reset-password";
import VerifyEmail from "./verify-email";

const Index = {
  path: "auth",
  Component: Layout,
  children: [
    {
      index: true,
      Component: SignIn.Component,
    },
    SignIn,
    ForgotPassword,
    ResetPassword,
    VerifyEmail,
  ],
};

export default Index;
