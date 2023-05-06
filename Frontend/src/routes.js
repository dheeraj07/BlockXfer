import UserProfile from "./views/UserProfile.js";
import Login from "./components/Login/Login";
import Payment from "./views/Payment";
import OTPForm from "./views/OTPRequestForm";
import OTPVerifyForm from "./views/OTPVerificationForm";
import TransactionsList from "./views/Transactions";
import RequestsList from "./views/Requests";

const dashboardRoutes = [
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-key-25",
    component: Login,
    layout: "/app",
  },
  {
    path: "/user",
    name: "User Profile",
    icon: "nc-icon nc-circle-09",
    component: UserProfile,
    layout: "/app"
  },
  {
    path: "/payment",
    name: "Send/Request",
    icon: "nc-icon nc-credit-card",
    component: Payment,
    layout: "/app"
  },
  {
    path: "/transaction",
    name: "Transactions",
    icon: "nc-icon nc-notes",
    component: TransactionsList,
    layout: "/app"
  },
  {
    path: "/requests",
    name: "Requests",
    icon: "nc-icon nc-money-coins",
    component: RequestsList,
    layout: "/app"
  },
  {
    path: "/getotp",
    name: "GetOTP",
    icon: "nc-icon nc-notes",
    component: OTPForm,
    layout: "/app",
    redirect: true
  },
  {
    path: "/verifyotp",
    name: "VerifyOTP",
    icon: "nc-icon nc-notes",
    component: OTPVerifyForm,
    layout: "/app",
  }
];

export default dashboardRoutes;
