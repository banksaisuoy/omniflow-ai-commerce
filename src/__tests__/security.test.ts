import { describe, it, expect } from 'vitest';
import { User } from '../models/user';

describe('Security - OWASP Top 10 Checks', () => {
  describe('A02:2021 - Cryptographic Failures', () => {
    it('encrypts and decrypts PII correctly', () => {
      const sensitiveData = 'user@example.com';
      // Set the env var for the test explicitly to prevent the throw Error
      process.env.ENCRYPTION_KEY = 'test-encryption-key-12345';
      const encrypted = User.encryptPII(sensitiveData);
      
      expect(encrypted).not.toBe(sensitiveData);
      expect(encrypted.length).toBeGreaterThan(0);
      
      const decrypted = User.decryptPII(encrypted);
      expect(decrypted).toBe(sensitiveData);
    });

    it('hashes passwords securely using bcrypt', async () => {
      const password = 'SuperSecurePassword123!';
      const hash = await User.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true); // bcrypt signature
      
      const isValid = await User.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await User.verifyPassword('WrongPassword!', hash);
      expect(isInvalid).toBe(false);
    });
  });
});