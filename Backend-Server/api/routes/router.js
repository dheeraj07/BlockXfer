const express = require("express");
const router = express.Router();

const {
  getTransaction,
  getRequest,
  getEscrow,
  getPhoneNumber,
  getPublicKey,
  encryptPhoneNumber,
  decryptPhoneNumber,
  savePhoneNumber,
  verifyOTP,
  sendOTP,
} = require("../controllers/controller");

router.get("/api/transactions/:address", getTransaction);

router.get("/api/requests/:address", getRequest);

router.get("/api/escrow", getEscrow);

router.get("/api/getPhoneNumber/:pubkey", getPhoneNumber);

router.get("/api/getPublicKey/:phNum", getPublicKey);

router.get("/api/encrypt/:phNum", encryptPhoneNumber);

router.get("/api/decrypt/:phNum", decryptPhoneNumber);

router.post("/api/phoneNumber", savePhoneNumber);

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

module.exports = router;
