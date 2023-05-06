const crypto = require("crypto");

function generateIV(plainText) {
  const hash = crypto.createHash("sha256").update(plainText).digest();
  return hash.slice(0, 16);
}

function encrypt(plainText, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  const iv = generateIV(plainText);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = cipher.update(plainText, "utf8", "hex") + cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return iv.toString("hex") + ":" + authTag + ":" + enc;
}

function decrypt(cipherText, keyHex) {
  const key = Buffer.from(keyHex, "hex");
  const parts = cipherText.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const enc = parts[2];
  const decipher = crypto
    .createDecipheriv("aes-256-gcm", key, iv)
    .setAuthTag(authTag);
  return decipher.update(enc, "hex", "utf8") + decipher.final("utf8");
}

module.exports = { encrypt, decrypt };
