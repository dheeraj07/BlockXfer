const { ethers } = require("ethers");
const phoneAbi = require("../../abis/phone.json");
require("dotenv").config();
const getRequestsdata = require("../views/requestList");
const getEscrowdata = require("../views/escrowList");
const getTransactionsdata = require("../views/transactionList");
let phoneContractAddress = process.env.DEPLOYED_PHONE_CONTRACT_ADDRESS;

getResponse = async (address, type, hash = null) => {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:8545/"
  );
  const deployPhoneContract = new ethers.Contract(
    phoneContractAddress,
    phoneAbi,
    provider
  );

  if (type == "transactions") {
    return await getTransactionsdata(deployPhoneContract, address);
  } else if (type == "requests") {
    return await getRequestsdata(deployPhoneContract, address);
  } else if (type == "escrow") {
    return await getEscrowdata(deployPhoneContract, address, hash);
  }
};

function hashString(string1) {
  return ethers.utils.solidityKeccak256(["string"], [string1]);
}

module.exports = getResponse;
