import React, { Fragment, useState } from "react";
import { ConnectWallet, useSigner, useAddress } from "@thirdweb-dev/react";
import { useAuth } from "../Auth";
import { Redirect } from "react-router-dom";
import "./login.css";

const Login = () => {
  const address = useSigner();
  const [user, setUser] = useState("");
  const auth = useAuth();

  const handleLogin = () => {
    auth.login("userLoggedIn");
  };

  const handleLogout = () => {
    auth.login(null);
  };

  return (
    <div>
      <ConnectWallet theme="light" className="connect-wallet">
        Connect!
      </ConnectWallet>
      {/*address ? <h5>Signer: {address._address}</h5> : <span>Not working</span>*/}
      {address ? handleLogin() : handleLogout()}
    </div>
  );
};

export default Login;
