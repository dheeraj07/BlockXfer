import { Button, Form, Modal, Card, FormControl } from "react-bootstrap";
import "../../src/assets/css/payment.css";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBackward,
  faPaperPlane,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import PhoneInput from "react-phone-number-input";
import { ethers } from "ethers";
import { NotificationManager } from "react-notifications";
import {
  deployedPhoneContractAddress,
  deployedUSDTContractAddress,
  deployedUSDCContractAddress,
  deployedDAIContractAddress,
} from "../deployedInfo/deployedInfo";
const phoneContractABI = require("../abi/phoneContractABI.json");
const tokenContractABI = require("../abi/tokenContractABI.json");

function PaymentForm({ closeForm, action }) {
  console.log("Received action:   ", action);
  const [mobileNumber, setMobileNumber] = useState("");
  const [asset, setAsset] = useState({ displayName: "", address: "" });
  const [amount, setAmount] = useState("");
  const [showModal, setShowModal] = useState(false);

  function removeSpaces(str) {
    const trimmedStr = str.trim();
    const noSpacesStr = trimmedStr.replace(/\s+/g, "");
    return noSpacesStr;
  }

  async function getPhoneNumberFromPubKey(pubKey) {
    try {
      const baseUrl = "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/getPhoneNumber/${pubKey}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        return await response.text();
      } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    return pubKey;
  }

  async function getPubKeyFromPhoneNumber() {
    try {
      const baseUrl = "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/getPublicKey/${removeSpaces(mobileNumber)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        return await response.text();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    return pubKey;
  }

  const checkIfMappingIsPresent = async () => {
    try {
      const baseUrl = "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/getPublicKey/${removeSpaces(mobileNumber)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        return true;
      } 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    return false;
  };

  const approveAllowance = async (tokenContract, phoneContract, tokens) => {
    try {
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 60000;
      const tx = await tokenContract.approve(phoneContract.address, tokens, {
        gasPrice: gasPrice,
        gasLimit: gasLimit,
      });
      await tx.wait();
      console.log("Allowance approved");
    } catch (error) {
      console.error("Error approving allowance:", error);
    }
  };

  const transferTokens = async (
    phoneContract,
    recipient,
    tokenContractAddress,
    tokens
  ) => {
    try {
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      const tx = await phoneContract.transferTokens(
        recipient,
        tokenContractAddress,
        tokens,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
      console.log("Payment Transaction sent:", tx.hash);
    } catch (error) {
      console.error("Error transferring tokens:", error);
    }
  };

  const requestTokens = async (
    phoneContract,
    recipient,
    tokenContractAddress,
    tokens
  ) => {
    try {
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      const tx = await phoneContract.requestPayment(
        recipient,
        tokenContractAddress,
        tokens,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
      console.log("Request transaction sent:", tx.hash);
    } catch (error) {
      console.error("Error Requesting tokens:", error);
    }
  };

  const escrowTokens = async (
    phoneContract,
    unregisteredReceiver,
    tokenContractAddress,
    tokens
  ) => {
    try {
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      const tx = await phoneContract.sendEcrowPayment(
        unregisteredReceiver,
        tokenContractAddress,
        tokens,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
      console.log("Escrow transaction sent:", tx.hash);
    } catch (error) {
      console.error("Error Escrowing tokens:", error);
    }
  };

  /**DECRYPt ENDPOINT
     try {
          const baseUrl = 'http://localhost:3000';
          const response = await fetch(`${baseUrl}/api/decrypt/${encryptedStr}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log(response)
          if(response.ok)
          {
            console.log(await response.text());
          }
          else{
            console.log("error");
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
     */

  const initiatePaymentTransfer = async () => {
    console.log("Initiating transfer");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const receipientAddress = await getPubKeyFromPhoneNumber();
    console.log(`send receipientAddress   ${receipientAddress}`);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(accounts[0]);
    console.log(signer._address);
    const phoneContract = new ethers.Contract(
      deployedPhoneContractAddress,
      phoneContractABI,
      signer
    );
    const tokenContract = new ethers.Contract(
      asset.address,
      tokenContractABI,
      signer
    );
    const tokens = ethers.utils.parseUnits(amount, 18);
    await approveAllowance(tokenContract, phoneContract, tokens);
    await transferTokens(
      phoneContract,
      receipientAddress,
      asset.address,
      tokens
    );
  };

  const initiatePaymentRequest = async () => {
    console.log("Initiating request");

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const receipientAddress = await getPubKeyFromPhoneNumber();
    console.log(`request receipientAddress   ${receipientAddress}`);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(accounts[0]);
    const phoneContract = new ethers.Contract(
      deployedPhoneContractAddress,
      phoneContractABI,
      signer
    );
    const tokenContract = new ethers.Contract(
      asset.address,
      tokenContractABI,
      signer
    );
    const tokens = ethers.utils.parseUnits(amount, 18);
    await requestTokens(
      phoneContract,
      receipientAddress,
      tokenContract.address,
      tokens
    );
  };

  const initiatePaymentEscrow = async () => {
    console.log("Initiating escrow");
    let encryptedStr;
    try {
      const baseUrl = "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/encrypt/${removeSpaces(mobileNumber)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        encryptedStr = await response.text();
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(accounts[0]);
    const phoneContract = new ethers.Contract(
      deployedPhoneContractAddress,
      phoneContractABI,
      signer
    );
    const tokenContract = new ethers.Contract(
      asset.address,
      tokenContractABI,
      signer
    );
    const tokens = ethers.utils.parseUnits(amount, 18);
    await approveAllowance(tokenContract, phoneContract, tokens);
    await escrowTokens(
      phoneContract,
      encryptedStr,
      tokenContract.address,
      tokens
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!asset) {
      NotificationManager.error(
        "Please select an asset",
        "You missed out filling all the required fields!"
      );
      return;
    }
    if (!amount || amount <= 0) {
      NotificationManager.error(
        "Amount value should be greater than 0",
        "Invalid amount value!"
      );
      return;
    }
    console.log("Starting transaction:   ", action);
    if (action.toString().includes("Send")) {
      const userRegistered = await checkIfMappingIsPresent();
      if (userRegistered) {
        initiatePaymentTransfer();
      } else {
        alert(
          "This user is not registered in the platform, the funds will be escrowed and will be available for the user to claim."
        );
        initiatePaymentEscrow();
      }
    } else {
      const isUserRegistered = await checkIfMappingIsPresent();
      if (isUserRegistered) {
        initiatePaymentRequest();
      } else {
        alert("Cannot request payment from unregistered users.");
      }
    }
  };

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const handleAssetSelect = (displayName, address) => {
    setAsset({ displayName, address });
    handleModalClose();
  };
  return (
    <Card className="registration-card">
      <Button className="back-btn" onClick={closeForm}>
        <FontAwesomeIcon icon={faBackward} className="mr-1" /> Back
      </Button>
      <Form onSubmit={handleSubmit} className="paymentForm">
        <Form.Group>
          <Form.Label>Mobile Number</Form.Label>
          <PhoneInput
            defaultCountry="US"
            value={mobileNumber}
            onChange={setMobileNumber}
            className="phoneInp"
            useNationalFormatForDefaultCountryValue={false}
            addInternationalOption={false}
            placeholder=""
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Select an Asset</Form.Label>
          <Button
            className="chooseBtn"
            variant="outline-primary"
            onClick={handleModalShow}
          >
            {asset.displayName || "SELECT"}
          </Button>
          <Modal show={showModal} onHide={handleModalClose}>
            <Modal.Header>
              <Modal.Title>Select an Asset</Modal.Title>
              <Button
                type="button"
                onClick={handleModalClose}
                className="btn-close"
                aria-label="Close"
              >
                X
              </Button>
            </Modal.Header>
            <Modal.Body>
              <Button
                onClick={() =>
                  handleAssetSelect("USDT", deployedUSDTContractAddress)
                }
              >
                USDT
              </Button>
              <Button
                onClick={() =>
                  handleAssetSelect("USDC", deployedUSDCContractAddress)
                }
              >
                USDC
              </Button>
              <Button
                onClick={() =>
                  handleAssetSelect("DAI", deployedDAIContractAddress)
                }
              >
                DAI
              </Button>
            </Modal.Body>
          </Modal>
        </Form.Group>

        <Form.Group>
          <Form.Label>Amount</Form.Label>
          <FormControl
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="paymentSubmit">
          {action.toString().includes("Send") ? (
            <FontAwesomeIcon icon={faPaperPlane} className="mr-1" />
          ) : (
            <FontAwesomeIcon icon={faArrowDown} className="mr-1" />
          )}
          {action}
        </Button>
      </Form>
    </Card>
  );
}

export default PaymentForm;
