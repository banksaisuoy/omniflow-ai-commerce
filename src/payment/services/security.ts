import CryptoJS from 'crypto-js';

/**
 * Gets the encryption key from the environment.
 * Throws an error if the key is not defined to prevent fallback to hardcoded secrets.
 */
const getEncryptionKey = (): string => {
  const key = import.meta.env.VITE_PAYMENT_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Critical Security Error: VITE_PAYMENT_ENCRYPTION_KEY is not defined.');
  }
  return key;
};

/**
 * Encrypts sensitive payment data using AES-256.
 * @param data The data object to encrypt.
 * @returns A base64 encoded encrypted string.
 */
export const encryptPaymentData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, getEncryptionKey()).toString();
  return encrypted;
};

/**
 * Decrypts encrypted payment data using AES-256.
 * @param encryptedData The base64 encoded encrypted string.
 * @returns The decrypted data object.
 */
export const decryptPaymentData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new Error('Failed to decrypt payment data. Invalid key or corrupted data.');
  }
  return JSON.parse(decryptedString);
};
