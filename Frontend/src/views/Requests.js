import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../components/Auth";
import {
  faSatelliteDish,
  faPaperPlane,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  deployedPhoneContractAddress,
  deployedUSDTContractAddress,
  deployedUSDCContractAddress,
  deployedDAIContractAddress,
  onwerAccountPrivateKey
} from "../deployedInfo/deployedInfo";
import "../assets/css/transactions.css";
import { Button, Table, OverlayTrigger, Tooltip } from "react-bootstrap";
const phoneContractABI = require("../abi/phoneContractABI.json");
const tokenContractABI = require("../abi/tokenContractABI.json");
const transactionStatus = {
  cancelRequest: 0,
  approveRequest: 1,
  rejectRequest: 2,
  claimFunds: 3
}

function RequestsList() {
  const [requestsData, setRequestsData] = useState();
  const [escrowData, setEscrowData] = useState();
  const [phoneNumbers, setPhoneNumbers] = useState({});
  const [requestLoading, setRequestLoading] = useState(true);
  const [escrowLoading, setEscrowLoading] = useState(true);
  const auth = useAuth();

  async function fetchPhoneNumbers(transactions) {
    for (const transaction of transactions) {
      if (!phoneNumbers[transaction.requestedBy]) {
        const phoneNumber = await getPhoneNumberFromPubKey(
          transaction.requestedBy
        );
        setPhoneNumbers((prevPhoneNumbers) => ({
          ...prevPhoneNumbers,
          [transaction.requestedBy]: phoneNumber,
        }));
      }
      if (!phoneNumbers[transaction.requestedFrom]) {
        const phoneNumber = await getPhoneNumberFromPubKey(
          transaction.requestedFrom
        );
        setPhoneNumbers((prevPhoneNumbers) => ({
          ...prevPhoneNumbers,
          [transaction.requestedFrom]: phoneNumber,
        }));
      }
    }
  }

  async function fetchPhoneNumbersForEscrow(transactions) {
    for (const transaction of transactions) {
      if (!phoneNumbers[transaction.sender]) {
        const phoneNumber = await getPhoneNumberFromPubKey(transaction.sender);
        setPhoneNumbers((prevPhoneNumbers) => ({
          ...prevPhoneNumbers,
          [transaction.sender]: phoneNumber,
        }));
      }
    }
  }

  function removeSpaces(str) {
    const trimmedStr = str.trim();
    const noSpacesStr = trimmedStr.replace(/\s+/g, "");
    return noSpacesStr;
  }

  const tokenAddresses = {
    [deployedUSDTContractAddress]: "USDT",
    [deployedUSDCContractAddress]: "USDC",
    [deployedDAIContractAddress]: "DAI",
  };

  const getEncryptedPhNum = async () => {
    let encryptedStr;
    try {
      const baseUrl = "http://localhost:3000";
      const response = await fetch(
        `${baseUrl}/api/encrypt/${removeSpaces(auth.mobileNumber)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        encryptedStr = await response.text();
        return encryptedStr;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    return null;
  };

  useEffect(() => {
    const fetchRequestsData = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(accounts[0]);
        const baseUrl = "http://localhost:3000";
        const response = await axios.get(
          `${baseUrl}/api/requests/${signer._address}`
        );
        setRequestsData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchEscrowData = async () => {
      let encryptedValue = await getEncryptedPhNum();
      const baseUrl = "http://localhost:3000";
      axios
        .get(`${baseUrl}/api/escrow`, {
          params: {
            hash: encryptedValue,
          },
        })
        .then((response) => {
          setEscrowData(response.data);
        })
        .catch((error) => {
          console.error("Error:", error.message);
        });
    };

    fetchRequestsData();
    fetchEscrowData();
  }, []);

  useEffect(() => {
    if (requestsData) {
      (async () => {
        await fetchPhoneNumbers(requestsData.sentRequests.fullfilled);
        await fetchPhoneNumbers(requestsData.sentRequests.pending);
        await fetchPhoneNumbers(requestsData.receivedRequests.fullfilled);
        await fetchPhoneNumbers(requestsData.receivedRequests.pending);
        setRequestLoading(false);
      })();
    }

    if (escrowData) {
      (async () => {
        await fetchPhoneNumbersForEscrow(escrowData.receivedEscrow.fullfilled);
        await fetchPhoneNumbersForEscrow(escrowData.receivedEscrow.pending);
        setEscrowLoading(false);
      })();
    }
  }, [requestsData, escrowData]);

  if (escrowLoading || requestLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden"></span>
        </div>
      </div>
    );
  }

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

  const cancelRequest = async (phoneContract, transactionNo, status) => {
    try {
      console.log("Initiating cancallation-2");
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      const tx = await phoneContract.fullFillRequestPayment(
        transactionNo,
        status,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
      console.log("Request cancelled successfully:", tx.hash);
    } catch (error) {
      console.error("Error transferring tokens:", error);
    }
  };

  const acceptRequest = async (
    phoneContract,
    tokenContract,
    transactionNo,
    tokens,
    status
  ) => {
    try {
      console.log("Initiating acceptance of request - 2");
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      await approveAllowance(tokenContract, phoneContract, tokens);
      const tx = await phoneContract.fullFillRequestPayment(
        transactionNo,
        status,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
      console.log("Request accepted successfully:", tx.hash);
    } catch (error) {
      console.error("Error transferring tokens:", error);
    }
  };

  const initiateCancelRequest = async (transactionNo, status) => {
    console.log("Initiating cancallation");
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
    await cancelRequest(phoneContract, transactionNo, status);
  };

  const initiateAcceptRequest = async (
    amount,
    transactionNo,
    requestedTokenAddr,
    status
  ) => {
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
      requestedTokenAddr,
      tokenContractABI,
      signer
    );
    const tokens = ethers.utils.parseUnits(amount, 18);
    await acceptRequest(
      phoneContract,
      tokenContract,
      transactionNo,
      tokens,
      status
    );
  };

  const cliamHelperUtility = async (transactionNo, currentSigner) => {
    try {
      const providerUrl = "http://localhost:8545";
      const wallet = new ethers.Wallet(onwerAccountPrivateKey);
      const provider = new ethers.providers.JsonRpcProvider(providerUrl);
      const connectedWallet = wallet.connect(provider);
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      const adminPhoneContract = new ethers.Contract(
        deployedPhoneContractAddress,
        phoneContractABI,
        connectedWallet
      );
      let encryptedValue = await getEncryptedPhNum();
      const tx = await adminPhoneContract.resolvePhonetoPublicAddress(
        transactionNo,
        encryptedValue,
        currentSigner,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const claimRequest = async (phoneContract, transactionNo, status) => {
    try {
      console.log("Initiating claiming of escrow - 2");
      const gasPrice = ethers.utils.parseUnits("5", "gwei");
      const gasLimit = 500000;
      const tx = await phoneContract.fullFillEscrowPayment(
        transactionNo,
        status,
        {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        }
      );
      await tx.wait();
      console.log("Request cancelled successfully:", tx.hash);
    } catch (error) {
      console.error("Error transferring tokens:", error);
    }
  };

  const initiateClaimRequest = async (transactionNo, status) => {
    console.log("Initiating acceptance of claim - 1");
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
    await cliamHelperUtility(transactionNo, signer._address);
    await claimRequest(phoneContract, transactionNo, status);
  };

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

  return (
    <>
      {requestsData && escrowData ? (
        <Table>
          <thead>
            <tr>
              <th>Type</th>
              <th>TransactionID</th>
              <th>Date</th>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Token</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requestsData
              ? requestsData.sentRequests.pending.map((request) => (
                  <tr key={request.transactionNo}>
                    <td style={{ width: "2px" }}>
                      <FontAwesomeIcon
                        icon={faSatelliteDish}
                        style={{ color: "green" }}
                        className="mr-4 sent-trans"
                      />
                    </td>
                    <td className="text-center">{request.transactionNo}</td>
                    <td>{request.date.split(" ")[0]}</td>
                    <td>{phoneNumbers[request.requestedFrom]}</td>
                    <td>{phoneNumbers[request.requestedBy]}</td>
                    <td>{tokenAddresses[request.token]}</td>
                    <td>{request.amount}</td>
                    <td className="td-actions">
                      <OverlayTrigger
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        overlay={
                          <Tooltip id="tooltip-255158527">
                            Cancel Request
                          </Tooltip>
                        }
                      >
                        <Button
                          className="btn-link btn-xs"
                          href="#pablo"
                          onClick={() =>
                            initiateCancelRequest(request.transactionNo, transactionStatus.cancelRequest)
                          }
                          variant="danger"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              : setRequestLoading(true)}

            {requestsData
              ? requestsData.sentRequests.fullfilled.map((request) => (
                  <tr className={
                    ethers.BigNumber.from(request.status).eq(ethers.BigNumber.from(transactionStatus.approveRequest.toString())) ? "success" : "danger"
                  } key={request.transactionNo}>
                    <td style={{ width: "2px" }}>
                      <FontAwesomeIcon
                        icon={faSatelliteDish}
                        style={{ color: "green" }}
                        className="mr-4 sent-trans"
                      />
                    </td>
                    <td className="text-center">{request.transactionNo}</td>
                    <td>{request.date.split(" ")[0]}</td>
                    <td>{phoneNumbers[request.requestedFrom]}</td>
                    <td>{phoneNumbers[request.requestedBy]}</td>
                    <td>{tokenAddresses[request.token]}</td>
                    <td>{request.amount}</td>
                    <td>
                      <td>
                        <i class="fa fa-ban" aria-hidden="true"></i>
                      </td>
                    </td>
                  </tr>
                ))
              : setRequestLoading(true)}

            {requestsData
              ? requestsData.receivedRequests.pending.map((request) => (
                  <tr key={request.transactionNo}>
                    <td style={{ width: "2px" }}>
                      <FontAwesomeIcon
                        icon={faPaperPlane}
                        style={{ color: "red" }}
                        className="mr-4 sent-trans"
                      />
                    </td>
                    <td className="text-center">{request.transactionNo}</td>
                    <td>{request.date.split(" ")[0]}</td>
                    <td>{phoneNumbers[request.requestedFrom]}</td>
                    <td>{phoneNumbers[request.requestedBy]}</td>
                    <td>{tokenAddresses[request.token]}</td>
                    <td>{request.amount}</td>
                    <td className="td-actions">
                      <OverlayTrigger
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        overlay={
                          <Tooltip id="tooltip-255158527">
                            Accept Request
                          </Tooltip>
                        }
                      >
                        <Button
                          className="btn-link btn-xs"
                          href="#pablo"
                          onClick={() =>
                            initiateAcceptRequest(
                              request.amount,
                              request.transactionNo,
                              request.token,
                              transactionStatus.approveRequest
                            )
                          }
                          variant="success"
                        >
                          <i
                            class="fa fa-check"
                            aria-hidden="true"
                            style={{ color: "green" }}
                          ></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        overlay={
                          <Tooltip id="tooltip-255158527">
                            Reject Request
                          </Tooltip>
                        }
                      >
                        <Button
                          className="btn-link btn-xs"
                          href="#pablo"
                          onClick={() =>
                            initiateCancelRequest(request.transactionNo, transactionStatus.rejectRequest)
                          }
                          variant="danger"
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              : setRequestLoading(true)}

            {requestsData
              ? requestsData.receivedRequests.fullfilled.map((request) => (
                  <tr className={
                    ethers.BigNumber.from(request.status).eq(ethers.BigNumber.from(transactionStatus.approveRequest.toString())) ? "success" : "danger"
                  } key={request.transactionNo}>
                    <td style={{ width: "2px" }}>
                      <FontAwesomeIcon
                        icon={faPaperPlane}
                        style={{ color: "red" }}
                        className="mr-4 sent-trans"
                      />
                    </td>
                    <td className="text-center">{request.transactionNo}</td>
                    <td>{request.date.split(" ")[0]}</td>
                    <td>{phoneNumbers[request.requestedFrom]}</td>
                    <td>{phoneNumbers[request.requestedBy]}</td>
                    <td>{tokenAddresses[request.token]}</td>
                    <td>{request.amount}</td>
                    <td>
                      <i class="fa fa-ban" aria-hidden="true"></i>
                    </td>
                  </tr>
                ))
              : setRequestLoading(true)}

            {escrowData
              ? escrowData.receivedEscrow.pending.map((escrowRequest) => (
                  <tr key={escrowRequest.transactionNo}>
                    <td style={{ width: "2px" }}>
                      <FontAwesomeIcon
                        icon={faSatelliteDish}
                        style={{ color: "green" }}
                        className="mr-4 sent-trans"
                      />
                    </td>
                    <td className="text-center">
                      {escrowRequest.transactionNo}
                    </td>
                    <td>{escrowRequest.date.split(" ")[0]}</td>
                    <td>{phoneNumbers[escrowRequest.sender]}</td>
                    <td>{auth.mobileNumber}</td>
                    <td>{tokenAddresses[escrowRequest.token]}</td>
                    <td>{escrowRequest.amount}</td>
                    <td className="td-actions">
                      <OverlayTrigger
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                        overlay={
                          <Tooltip id="tooltip-255158527">Claim funds</Tooltip>
                        }
                      >
                        <Button
                          className="btn-link btn-xs"
                          href="#pablo"
                          onClick={() =>
                            initiateClaimRequest(escrowRequest.transactionNo, transactionStatus.claimFunds)
                          }
                          variant="success"
                        >
                          <i
                            class="fa fa-check"
                            aria-hidden="true"
                            style={{ color: "green" }}
                          ></i>
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              : setEscrowLoading(true)}

            {escrowData
              ? escrowData.receivedEscrow.fullfilled.map((escrowRequest) => (
                  <tr className="success" key={escrowRequest.transactionNo}>
                    <td style={{ width: "2px" }}>
                      <FontAwesomeIcon
                        icon={faSatelliteDish}
                        style={{ color: "green" }}
                        className="mr-4 sent-trans"
                      />
                    </td>
                    <td className="text-center">
                      {escrowRequest.transactionNo}
                    </td>
                    <td>{escrowRequest.date.split(" ")[0]}</td>
                    <td>{phoneNumbers[escrowRequest.sender]}</td>
                    <td>{auth.mobileNumber}</td>
                    <td>{tokenAddresses[escrowRequest.token]}</td>
                    <td>{escrowRequest.amount}</td>
                    <td>
                      <i class="fa fa-ban" aria-hidden="true"></i>
                    </td>
                  </tr>
                ))
              : setEscrowLoading(true)}
          </tbody>
        </Table>
      ) : (
        "Loading"
      )}
    </>
  );
}

export default RequestsList;
