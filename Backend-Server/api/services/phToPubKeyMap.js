class PhoneNumberPublicKeyMap {
  constructor() {
    this.encryptedPhoneToPublicKey = {};
    this.publicKeyToEncryptedPhone = {};
  }

  set(encryptedPhone, publicKey) {
    this.deleteByEncryptedPhone(encryptedPhone);
    this.deleteByPublicKey(publicKey);

    this.encryptedPhoneToPublicKey[encryptedPhone] = publicKey;
    this.publicKeyToEncryptedPhone[publicKey] = encryptedPhone;
  }

  getPublicKeyByEncryptedPhone(encryptedPhone) {
    return this.encryptedPhoneToPublicKey[encryptedPhone];
  }

  getEncryptedPhoneByPublicKey(publicKey) {
    return this.publicKeyToEncryptedPhone[publicKey];
  }

  deleteByEncryptedPhone(encryptedPhone) {
    const publicKey = this.encryptedPhoneToPublicKey[encryptedPhone];
    if (publicKey) {
      delete this.encryptedPhoneToPublicKey[encryptedPhone];
      delete this.publicKeyToEncryptedPhone[publicKey];
    }
  }

  deleteByPublicKey(publicKey) {
    const encryptedPhone = this.publicKeyToEncryptedPhone[publicKey];
    if (encryptedPhone) {
      delete this.publicKeyToEncryptedPhone[publicKey];
      delete this.encryptedPhoneToPublicKey[encryptedPhone];
    }
  }
}

module.exports = { PhoneNumberPublicKeyMap };
