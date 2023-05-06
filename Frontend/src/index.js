import React from "react";
import ReactDOM from "react-dom/client";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./components/Auth";
import "react-notifications/lib/notifications.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThirdwebProvider activeChain="ethereum">
    <AuthProvider>
      <BrowserRouter>
        <Switch>
          <Route path="/app" render={(props) => <App {...props} />} />
          <Redirect from="/" to="/app/login" />
        </Switch>
      </BrowserRouter>
    </AuthProvider>
  </ThirdwebProvider>
);
