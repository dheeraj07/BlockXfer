const { encrypt, decrypt } = require("./encryption");
const { ThirdwebStorage } = require("@thirdweb-dev/storage");
let { PhoneNumberPublicKeyMap } = require("./phToPubKeyMap");
const { readFromFile, writeToFile } = require("../helpers/fileDataHandler");
require("dotenv").config();
const keyHex = process.env.SECRET_ENCRYPTION_KEY;
const storage = new ThirdwebStorage();
let phoneNumberPublicKeyMap = new PhoneNumberPublicKeyMap();
let uri;

const initialiseIPFSData = async () => {
  try {
    const backupUri = readFromFile();
    if (backupUri) {
      uri = backupUri;
    } else {
      uri = await storage.upload(phoneNumberPublicKeyMap);
      writeToFile(uri);
    }
  } catch (error) {
    console.error("Error initializing the uri:", error);
    uri = await storage.upload(phoneNumberPublicKeyMap);
    writeToFile(uri);
  }
};

const storeData = async (phNum, pubkey) => {
  let data = await storage.downloadJSON(uri);

  phoneNumberPublicKeyMap.encryptedPhoneToPublicKey =
    data.encryptedPhoneToPublicKey;
  phoneNumberPublicKeyMap.publicKeyToEncryptedPhone =
    data.publicKeyToEncryptedPhone;

  let encryptedPhNumber = encrypt(phNum, keyHex);
  phoneNumberPublicKeyMap.set(encryptedPhNumber, pubkey);
  uri = await storage.upload(phoneNumberPublicKeyMap);
  writeToFile(uri);
  return true;
};

const getPublicKeyFromStorage = async (phNum) => {
  let data = await storage.downloadJSON(readFromFile());
  const val = data?.encryptedPhoneToPublicKey?.[encrypt(phNum, keyHex)] ?? null;
  if (val) {
    return val;
  }
  return false;
};

const getPhNumFromStorage = async (pubKey) => {
  let data = await storage.downloadJSON(readFromFile());
  const val = data?.publicKeyToEncryptedPhone?.[pubKey] ?? null;
  if (val) {
    return decrypt(val, keyHex);
  }
  return false;
};

module.exports = {
  storeData,
  getPhNumFromStorage,
  getPublicKeyFromStorage,
  initialiseIPFSData,
};
