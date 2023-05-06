const { ethers } = require("ethers");
const moment = require("moment");

async function getSentEscrowRequestsData(deployPhoneContract, owner) {
  if (owner == null) return;
  const filterpRE = deployPhoneContract.filters.escrowPaymentEve(
    null,
    owner,
    null,
    null,
    null
  );
  const prePayments = await deployPhoneContract.queryFilter(filterpRE);

  const filterpOST = deployPhoneContract.filters.fullfillEscrowPaymentEve(
    null,
    owner,
    null,
    null,
    null,
    null
  );
  const postPayments = await deployPhoneContract.queryFilter(filterpOST);

  const fullFilledRequests = prePayments
    .filter((preLog) => {
      const preTransactionNo = preLog.args.transactionNo.toString();
      return postPayments.some(
        (postLog) => postLog.args.transactionNo.toString() === preTransactionNo
      );
    })
    .map((preLog) => {
      const currentFullfilledTransaction = postPayments.find(transaction => transaction.args.transactionNo.toString() === preLog.args.transactionNo.toString());
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        receiverAddress: currentFullfilledTransaction.args.receiverAdress,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment
          .unix(preLog.args.date.toString())
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

  const pendingRequests = prePayments
    .filter((preLog) => {
      const preTransactionNo = preLog.args.transactionNo.toString();
      return !postPayments.some(
        (postLog) => postLog.args.transactionNo.toString() === preTransactionNo
      );
    })
    .map((preLog) => {
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment
          .unix(preLog.args.date.toString())
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });
  return { fullfilled: fullFilledRequests, pending: pendingRequests };
}

async function getReceivedEscrowRequestsData(deployPhoneContract, hashVal) {
  if (hashVal == null) return;
  const filterpRE = deployPhoneContract.filters.escrowPaymentEve(
    null,
    null,
    hashVal,
    null,
    null
  );
  const prePayments = await deployPhoneContract.queryFilter(filterpRE);

  const filterpOST = deployPhoneContract.filters.fullfillEscrowPaymentEve(
    null,
    null,
    hashVal,
    null,
    null
  );
  const postPayments = await deployPhoneContract.queryFilter(filterpOST);

  const fullFilledRequests = prePayments
    .filter((preLog) => {
      const preTransactionNo = preLog.args.transactionNo.toString();
      return postPayments.some(
        (postLog) => postLog.args.transactionNo.toString() === preTransactionNo
      );
    })
    .map((preLog) => {
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment
          .unix(preLog.args.date.toString())
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

  const pendingRequests = prePayments
    .filter((preLog) => {
      const preTransactionNo = preLog.args.transactionNo.toString();
      return !postPayments.some(
        (postLog) => postLog.args.transactionNo.toString() === preTransactionNo
      );
    })
    .map((preLog) => {
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        sender: preLog.args.sender,
        receiver: preLog.args.receiver,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment
          .unix(preLog.args.date.toString())
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

  return { fullfilled: fullFilledRequests, pending: pendingRequests };
}

//For the person who already has an account, pass both address and hashVal for fetching the sent and received escrow requests
getEscrowdata = async (deployPhoneContract, address, hashVal) => {
  let response = {};
  response.sentEscrow = await getSentEscrowRequestsData(
    deployPhoneContract,
    address
  );

  response.receivedEscrow = await getReceivedEscrowRequestsData(
    deployPhoneContract,
    hashVal
  );
  return response;
};

module.exports = getEscrowdata;
