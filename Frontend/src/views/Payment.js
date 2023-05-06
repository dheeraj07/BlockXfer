import React, { useState } from "react";
import PaymentForm from "./PaymentForm";
import "../../src/assets/css/payment.css";

const Payment = () => {
  const [showForm, setShowPaymentForm] = useState(false);
  const [action, setAction] = useState("");

  function showPaymentForm(value, action) {
    setAction(action);
    setShowPaymentForm(value);
  }

  return (
    <div className="container">
      <div className="centered-box">
        {!showForm ? (
          <div className="button-container">
            <button
              className="big-button"
              onClick={() => showPaymentForm(true, "Send")}
            >
              Send
            </button>
            <button
              className="big-button"
              onClick={() => showPaymentForm(true, "Request")}
            >
              Request
            </button>
          </div>
        ) : (
          <PaymentForm
            closeForm={() => showPaymentForm(false)}
            action={action}
          />
        )}
      </div>
    </div>
  );
};

export default Payment;
