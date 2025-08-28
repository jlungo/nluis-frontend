import Layout from "./layout";
import Auth from "./(auth)";
import ForgotPassword from "./forgot-password";
import ResetPassword from "./reset-password";
import VerifyEmail from "./verify-email";

const Index = {
  path: "auth",
  Component: Layout,
  children: [Auth, ForgotPassword, ResetPassword, VerifyEmail],
};

export default Index;
