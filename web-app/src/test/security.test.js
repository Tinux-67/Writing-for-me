import { describe, it, expect } from 'vitest';
import {
  generateSalt, generateId, validatePassword, sanitizeHTML,
  encryptContent, decryptContent
} from '../utils/security';

describe('Security Utilities', () => {
  describe('generateSalt', () => {
    it('should generate a salt of correct length', () => {
      const salt = generateSalt(16);
      expect(salt).toHaveLength(32); // hex encoded: 16 bytes = 32 hex chars
    });

    it('should generate unique salts', () => {
      const s1 = generateSalt();
      const s2 = generateSalt();
      expect(s1).not.toBe(s2);
    });

    it('should generate a valid hex string', () => {
      const salt = generateSalt(16);
      expect(salt).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>')).not.toContain('<script');
    });

    it('should remove iframes', () => {
      expect(sanitizeHTML('<div><iframe src="malicious.com"></iframe></div>')).not.toContain('<iframe');
    });

    it('should remove event handlers', () => {
      expect(sanitizeHTML('<div onclick="alert(\'xss\')">Content</div>')).not.toContain('onclick');
    });

    it('should preserve safe HTML', () => {
      expect(sanitizeHTML('<div><p>Safe content</p></div>')).toContain('<p>Safe content</p>');
    });

    it('should handle null input', () => {
      expect(sanitizeHTML(null)).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate a unique ID', () => {
      expect(generateId()).not.toBe(generateId());
    });

    it('should generate a valid UUID v4', () => {
      expect(generateId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('validatePassword', () => {
    it('should reject short passwords', () => {
      const r = validatePassword('short');
      expect(r.valid).toBe(false);
      expect(r.message).toContain('8 characters');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('nouppercase123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('uppercase');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('NOLOWERCASE123!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('lowercase');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('number');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('NoSpecialChars123');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('special character');
    });

    it('should accept strong passwords', () => {
      const result = validatePassword('StrongPassword123!');
      expect(result.valid).toBe(true);
      expect(result.message).toContain('secure');
    });
  });

  describe('encryption/decryption', () => {
    it('should encrypt and decrypt content correctly', async () => {
      const content = 'This is a secret message';
      const password = 'StrongPassword123!';

      const encrypted = await encryptContent(content, password);
      expect(encrypted.encrypted).not.toBe(content);
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.iv).toBeDefined();

      const decrypted = await decryptContent(
        encrypted.encrypted,
        password,
        encrypted.salt,
        encrypted.iv
      );
      expect(decrypted).toBe(content);
    });

    it('should fail to decrypt with wrong password', async () => {
      const encrypted = await encryptContent('secret', 'StrongPassword123!');
      await expect(
        decryptContent(encrypted.encrypted, 'WrongPassword456!', encrypted.salt, encrypted.iv)
      ).rejects.toThrow();
    });

    it('should produce different ciphertext each time (random IV)', async () => {
      const e1 = await encryptContent('same content', 'StrongPassword123!');
      const e2 = await encryptContent('same content', 'StrongPassword123!');
      expect(e1.encrypted).not.toBe(e2.encrypted);
      expect(e1.salt).not.toBe(e2.salt);
      expect(e1.iv).not.toBe(e2.iv);
    });

    it('should return base64-encoded ciphertext', async () => {
      const encrypted = await encryptContent('test content', 'StrongPassword123!');
      expect(() => atob(encrypted.encrypted)).not.toThrow();
    });

    it('should return hex-encoded salt and iv', async () => {
      const encrypted = await encryptContent('test content', 'StrongPassword123!');
      expect(encrypted.salt).toMatch(/^[0-9a-f]+$/);
      expect(encrypted.iv).toMatch(/^[0-9a-f]+$/);
    });
  });
});
