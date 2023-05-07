const { ethers } = require("ethers");
const moment = require("moment");

getSentRequestsData = async (deployPhoneContract, owner) => {
  const filterpRE = deployPhoneContract.filters.requestPaymentEve(
    null,
    owner,
    null,
    null,
    null,
    null
  );
  const prePayments = await deployPhoneContract.queryFilter(filterpRE);

  const filterpOST = deployPhoneContract.filters.fullfillRequestPaymentEve(
    null,
    owner,
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
      const currentFullfilledRequest = postPayments.find(request => request.args.transactionNo.toString() === preLog.args.transactionNo.toString());
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        requestedBy: preLog.args.requestedBy,
        requestedFrom: preLog.args.requestedFrom,
        token: preLog.args.token,
        status: currentFullfilledRequest.args.status,
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
        requestedBy: preLog.args.requestedBy,
        requestedFrom: preLog.args.requestedFrom,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment
          .unix(preLog.args.date.toString())
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

  return { fullfilled: fullFilledRequests, pending: pendingRequests };
};

getReceiveRequestsData = async (deployPhoneContract, owner) => {
  const filterpRE = deployPhoneContract.filters.requestPaymentEve(
    null,
    null,
    owner,
    null,
    null,
    null
  );
  const prePayments = await deployPhoneContract.queryFilter(filterpRE);

  const filterpOST = deployPhoneContract.filters.fullfillRequestPaymentEve(
    null,
    null,
    owner,
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
      const currentFullfilledRequest = postPayments.find(request => request.args.transactionNo.toString() === preLog.args.transactionNo.toString());
      return {
        transactionNo: preLog.args.transactionNo.toString(),
        requestedBy: preLog.args.requestedBy,
        requestedFrom: preLog.args.requestedFrom,
        token: preLog.args.token,
        status: currentFullfilledRequest.args.status,
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
        requestedBy: preLog.args.requestedBy,
        requestedFrom: preLog.args.requestedFrom,
        token: preLog.args.token,
        amount: ethers.utils.formatUnits(preLog.args.amount, "ether"),
        date: moment
          .unix(preLog.args.date.toString())
          .format("YYYY-MM-DD HH:mm:ss"),
      };
    });

  return { fullfilled: fullFilledRequests, pending: pendingRequests };
};

getRequestsdata = async (deployPhoneContract, address) => {
  const sentRequests = await getSentRequestsData(deployPhoneContract, address);
  const receivedRequests = await getReceiveRequestsData(
    deployPhoneContract,
    address
  );
  let response = {};
  response.sentRequests = sentRequests;
  response.receivedRequests = receivedRequests;
  return response;
};

module.exports = getRequestsdata;
