const { ethers } = require("ethers");
const moment = require("moment");

const getSentTransactionsData = async (deployPhoneContract, owner) => {
  const filterpOST = deployPhoneContract.filters.postPaymentEve(
    null,
    owner,
    null,
    null,
    null,
    false,
    null
  );
  const postPayments = await deployPhoneContract.queryFilter(filterpOST);
  let successfulTransactions = postPayments.map((postLog) => {
    return {
      transactionNo: postLog.args.transactionNo.toString(),
      sender: postLog.args.sender,
      receiver: postLog.args.receiver,
      token: postLog.args.token,
      amount: ethers.utils.formatUnits(postLog.args.amount, "ether"),
      date: moment
        .unix(postLog.args.date.toString())
        .format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return successfulTransactions;
};

const getReceiveTransactionsData = async (deployPhoneContract, owner) => {
  let filterpOST = deployPhoneContract.filters.postPaymentEve(
    null,
    null,
    owner,
    null,
    null,
    false,
    null
  );
  let postPayments = await deployPhoneContract.queryFilter(filterpOST);

  let successfulTransactions = postPayments.map((postLog) => {
    return {
      transactionNo: postLog.args.transactionNo.toString(),
      sender: postLog.args.sender,
      receiver: postLog.args.receiver,
      token: postLog.args.token,
      amount: ethers.utils.formatUnits(postLog.args.amount, "ether"),
      date: moment
        .unix(postLog.args.date.toString())
        .format("YYYY-MM-DD HH:mm:ss"),
    };
  });

  return successfulTransactions;
};

const getTransactionsdata = async (deployPhoneContract, address) => {
  const sentTransactions = await getSentTransactionsData(
    deployPhoneContract,
    address
  );
  const receivedTransactions = await getReceiveTransactionsData(
    deployPhoneContract,
    address
  );
  let response = {};
  response["sentTransactions"] = sentTransactions;
  response["receivedTransactions"] = receivedTransactions;
  return response;
};

module.exports = getTransactionsdata;
