import React, { useState, useEffect } from "react";
import { useAuth } from "./Auth";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";

export const RequireAuth = ({ children }) => {
  const [redirection, setRedirection] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = useAuth();

  const checkIfMappingIsPresent = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(accounts[0]);
      const baseUrl = "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/getPhoneNumber/${signer._address}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        auth.setMobileNumber(await response.text());
        return true;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    return false;
  };

  useEffect(() => {
    (async () => {
      const mappingIsPresent = await checkIfMappingIsPresent();
      if (
        !mappingIsPresent &&
        (auth.mobileInput === 0 ||
          (auth.mobileInput === 1 &&
            !children.type.toString().includes("OTPVerifyForm")))
      ) {
        setRedirection(<Redirect to="getotp" />);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return <Redirect to="login" />;
  } else if (redirection) {
    return <Redirect to="getotp" />;
  }
  return children;
};
