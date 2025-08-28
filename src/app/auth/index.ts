import Layout from "./layout";
import Auth from "./(auth)";
import EmailSent from "./email-sent";
import ForgotPassword from "./forgot-password";
import ResetPassword from "./reset-password";
import VerifyEmail from "./verify-email";

const Index = {
  path: "auth",
  Component: Layout,
  children: [Auth, EmailSent, ForgotPassword, ResetPassword, VerifyEmail],
};

export default Index;
