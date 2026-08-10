import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_PAYMENT_ENCRYPTION_KEY;

/**
 * Encrypts sensitive payment data using AES-256.
 * @param data The data object to encrypt.
 * @returns A base64 encoded encrypted string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encryptPaymentData = (data: any): string => {
  if (!ENCRYPTION_KEY) {
    throw new Error('CRITICAL: Payment encryption key is not configured.');
  }
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  return encrypted;
};

/**
 * Decrypts encrypted payment data using AES-256.
 * @param encryptedData The base64 encoded encrypted string.
 * @returns The decrypted data object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const decryptPaymentData = (encryptedData: string): any => {
  if (!ENCRYPTION_KEY) {
    throw new Error('CRITICAL: Payment encryption key is not configured.');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new Error('Failed to decrypt payment data. Invalid key or corrupted data.');
  }
  return JSON.parse(decryptedString);
};
