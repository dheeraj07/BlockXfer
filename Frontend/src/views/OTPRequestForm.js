import {
  Button,
  Form,
  Dropdown,
  Modal,
  Card,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import "../assets/css/otp.css";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMobile } from "@fortawesome/free-solid-svg-icons";
import PhoneInput from "react-phone-number-input";
import { useAuth } from "../components/Auth";
import { Link } from "react-router-dom";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";

function OTPForm() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [showVerifyButton, setShowVerifyButton] = useState(false);
  const auth = useAuth();

  function setPhoneNumber(value) {
    setMobileNumber(value);
  }

  async function sendOTP() {
    const url = `http://localhost:3000/send-otp?phNum=${mobileNumber}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      auth.setMobileNumberAuth(1);
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  const handleReceiveOtpClick = () => {
    NotificationManager.success(
      "Please verify your OTP",
      "OTP Sent Successfully"
    );
    auth.setMobileNumber(mobileNumber);
    sendOTP();
    setShowVerifyButton(true);
  };

  return (
    <Card className="registration-card-otp">
      <Form className="paymentForm-otp">
        <Form.Group>
          <Form.Label>Mobile Number</Form.Label>
          <PhoneInput
            defaultCountry="US"
            value={mobileNumber}
            onChange={setPhoneNumber}
            className="phoneInp-otp"
            placeholder="Enter Your Phonenumber"
          />
        </Form.Group>

        {!showVerifyButton && (
          <Button
            variant="primary"
            type="submit"
            className="paymentSubmit-otp"
            onClick={handleReceiveOtpClick}
          >
            <FontAwesomeIcon icon={faMobile} className="mr-3" />
            Receive OTP
          </Button>
        )}

        {showVerifyButton && (
          <Link to="/app/verifyotp">
            <Button
              variant="primary"
              type="submit"
              className="paymentSubmit-otp verify-btn"
            >
              Verify OTP
            </Button>
          </Link>
        )}
      </Form>
      <NotificationContainer />
    </Card>
  );
}

export default OTPForm;
