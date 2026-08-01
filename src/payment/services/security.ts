import CryptoJS from 'crypto-js';

// In a real application, this should be an environment variable.
// We provide a fallback for demonstration purposes.
const ENCRYPTION_KEY = import.meta.env.VITE_PAYMENT_ENCRYPTION_KEY || 'default-secure-key-32-chars-long!';

/**
 * Encrypts sensitive payment data using AES-256.
 * @param data The data object to encrypt.
 * @returns A base64 encoded encrypted string.
 */
export const encryptPaymentData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  return encrypted;
};

/**
 * Decrypts encrypted payment data using AES-256.
 * @param encryptedData The base64 encoded encrypted string.
 * @returns The decrypted data object.
 */
export const decryptPaymentData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new Error('Failed to decrypt payment data. Invalid key or corrupted data.');
  }
  return JSON.parse(decryptedString);
};
