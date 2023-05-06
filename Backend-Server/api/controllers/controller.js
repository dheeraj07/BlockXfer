const { Twilio } = require("twilio");
const getResponse = require("../helpers/requestHandler");
const {
  storeData,
  getPhNumFromStorage,
  getPublicKeyFromStorage,
} = require("../services/IPFSLinker");
const { encrypt, decrypt } = require("../services/encryption");
const keyHex = process.env.SECRET_ENCRYPTION_KEY;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require("twilio")(accountSid, authToken);

const getTransaction = async (req, res) => {
  const addr = req.params.address;
  console.log("TRANSACTION:  ", addr);
  res.send(await getResponse(addr, "transactions"));
};

const getRequest = async (req, res) => {
  const addr = req.params.address;
  res.send(await getResponse(addr, "requests"));
};

const getEscrow = async (req, res) => {
  const addr = req.query.addr;
  const hash = req.query.hash;
  res.send(await getResponse(addr, "escrow", hash));
};

const getPhoneNumber = async (req, res) => {
  const pubKey = req.params.pubkey;
  const phNum = await getPhNumFromStorage(pubKey);
  if (phNum) {
    res.status(200).send(phNum);
  } else {
    res.status(400).send();
  }
};

const getPublicKey = async (req, res) => {
  const phNum = req.params.phNum;
  const pubKey = await getPublicKeyFromStorage(phNum);
  if (pubKey) {
    res.status(200).send(pubKey);
  } else {
    res.status(400).send();
  }
};

const encryptPhoneNumber = async (req, res) => {
  const stringToBeEncrypted = req.params.phNum;
  const finalVal = encrypt(stringToBeEncrypted, keyHex);
  res.status(200).send(finalVal);
};

const decryptPhoneNumber = async (req, res) => {
  const stringToBeDecrypted = req.params.phNum;
  res.send(decrypt(stringToBeDecrypted, keyHex));
};

const savePhoneNumber = async (req, res) => {
  const phNum = req.body.phNum;
  const pubKey = req.body.pubKey;
  const retVal = await storeData(phNum, pubKey);
  console.log(retVal);

  if (retVal == true) {
    res.status(201);
  } else {
    res.status(400);
  }
  res.send();
};

const sendOTP = async (req, res) => {
  const phoneNumber = req.query.phNum;

  try {
    const otpResponse = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: "+" + phoneNumber, channel: "sms" })
      .then((verification) => console.log(verification.status));
    res.status(200).send("OTP Sent Successfully");
  } catch (error) {
    console.log(error);
    res.send(400);
  }
};

const verifyOTP = async (req, res) => {
  const otp = req.query.otpCode;
  const phoneNumber = req.query.phNum;

  try {
    const status = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: "+" + phoneNumber, code: otp })
      .then((verification_check) => console.log(verification_check.status));
    res.status(200).send("OTP Verification Successful");
  } catch (error) {
    res.send(400);
  }
};

module.exports = {
  getTransaction,
  getRequest,
  getEscrow,
  getPhoneNumber,
  getPublicKey,
  encryptPhoneNumber,
  decryptPhoneNumber,
  savePhoneNumber,
  sendOTP,
  verifyOTP,
};
