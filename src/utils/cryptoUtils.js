// client/src/cryptoUtils.js
import CryptoJS from "crypto-js";

// Derive a key from password
export function deriveKey(password) {
  return CryptoJS.SHA256(password);
}

// Encrypt master key with password-derived key
export function encryptMasterKey(masterKey, password) {
  const derivedKey = deriveKey(password);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(masterKey, derivedKey, {
    iv,
  }).toString();
  console.log("encryptMasterKey", encrypted, iv.toString(CryptoJS.enc.Hex));
  return JSON.stringify({
    ciphertext: encrypted,
    iv: iv.toString(CryptoJS.enc.Hex),
  });
}

// Decrypt master key
export function decryptMasterKey(encryptedMasterKey, password) {
  const derivedKey = deriveKey(password);
  const { ciphertext, iv } = JSON.parse(encryptedMasterKey);
  const decrypted = CryptoJS.AES.decrypt(ciphertext, derivedKey, {
    iv: CryptoJS.enc.Hex.parse(iv),
  });
  console.log("decryptMasterKey", decrypted.toString(CryptoJS.enc.Utf8));
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Encrypt user data using master key
export function encryptData(data, masterKey) {
  return CryptoJS.AES.encrypt(data, masterKey).toString();
}

// Decrypt user data
export function decryptData(encryptedData, masterKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, masterKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function safeDecrypt(value, key) {
  try {
    // Try to decrypt; if it fails, return the original value
    const decrypted = decryptData(value, key);
    // Optionally, check if the decrypted value is a valid number for amount

    if (decrypted === "" || decrypted == null) {
      // If not valid, fallback to original
      return value;
    }
    return decrypted;
  } catch (eror) {
    console.error("Decryption failed, returning original value:", eror, value);
    return value;
  }
}
