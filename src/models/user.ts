import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';

const getEncryptionKey = () => {
  // Try process.env first for Node env, fallback to import.meta.env for Vite
  const key = (typeof process !== 'undefined' && process.env.ENCRYPTION_KEY) 
    || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ENCRYPTION_KEY);
    
  if (!key) {
    throw new Error('ENCRYPTION_KEY is not defined in the environment.');
  }
  return key;
};

export class User {
  static encryptPII(data: string): string {
    return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
  }

  static decryptPII(cipherText: string): string {
    const bytes = CryptoJS.AES.decrypt(cipherText, getEncryptionKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}