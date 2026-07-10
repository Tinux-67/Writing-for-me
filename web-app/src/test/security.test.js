/**
 * Tests for security utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateSalt,
  deriveKey,
  encryptContent,
  decryptContent,
  sanitizeHTML,
  sanitizeFilename,
  validateTitle,
  validateContent,
  generateId,
  validatePassword
} from '../utils/security';

describe('Security Utilities', () => {
  describe('generateSalt', () => {
    it('should generate a salt of the specified length', () => {
      const salt = generateSalt(16);
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex characters
    });

    it('should generate different salts each time', () => {
      const salt1 = generateSalt(16);
      const salt2 = generateSalt(16);
      expect(salt1).not.toBe(salt2);
    });

    it('should generate a salt with hex characters only', () => {
      const salt = generateSalt(16);
      expect(salt).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('validateTitle', () => {
    it('should return "Untitled Note" for empty title', () => {
      expect(validateTitle('')).toBe('Untitled Note');
      expect(validateTitle('   ')).toBe('Untitled Note');
    });

    it('should trim whitespace', () => {
      expect(validateTitle('  Test  ')).toBe('Test');
    });

    it('should limit title length to 200 characters', () => {
      const longTitle = 'a'.repeat(300);
      expect(validateTitle(longTitle)).toHaveLength(200);
    });

    it('should preserve valid titles', () => {
      expect(validateTitle('My Note')).toBe('My Note');
      expect(validateTitle('Test #123')).toBe('Test #123');
    });
  });

  describe('validateContent', () => {
    it('should handle empty content', () => {
      expect(validateContent('')).toBe('');
      expect(validateContent(null)).toBe('');
      expect(validateContent(undefined)).toBe('');
    });

    it('should limit content length to 1MB', () => {
      const longContent = 'a'.repeat(2000000);
      expect(validateContent(longContent)).toHaveLength(1000000);
    });

    it('should preserve valid content', () => {
      const content = '# Hello\n\nThis is a test.';
      expect(validateContent(content)).toBe(content);
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove invalid characters', () => {
      expect(sanitizeFilename('test<>:"/\\|?*')).toBe('test_________');
    });

    it('should prevent path traversal', () => {
      expect(sanitizeFilename('../test')).toBe('_test');
      expect(sanitizeFilename('test/../file')).toBe('test__file');
    });

    it('should remove leading dots', () => {
      expect(sanitizeFilename('.test')).toBe('_test');
    });

    it('should remove trailing slashes', () => {
      expect(sanitizeFilename('test/')).toBe('test');
    });

    it('should limit length to 255 characters', () => {
      const longFilename = 'a'.repeat(300);
      expect(sanitizeFilename(longFilename)).toHaveLength(255);
    });

    it('should handle empty filename', () => {
      expect(sanitizeFilename('')).toBe('untitled');
    });
  });

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const html = '<div><script>alert("xss")</script>Content</div>';
      expect(sanitizeHTML(html)).not.toContain('<script>');
    });

    it('should remove iframe tags', () => {
      const html = '<div><iframe src="malicious.com"></iframe></div>';
      expect(sanitizeHTML(html)).not.toContain('<iframe');
    });

    it('should remove event handlers', () => {
      const html = '<div onclick="alert(\'xss\')">Content</div>';
      expect(sanitizeHTML(html)).not.toContain('onclick');
    });

    it('should preserve safe HTML', () => {
      const html = '<div><p>Safe content</p></div>';
      expect(sanitizeHTML(html)).toContain('<p>Safe content</p>');
    });

    it('should handle null input', () => {
      expect(sanitizeHTML(null)).toBe('');
    });
  });

  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should generate a valid UUID v4', () => {
      const id = generateId();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('validatePassword', () => {
    it('should reject short passwords', () => {
      const result = validatePassword('short');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('8 characters');
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
      const content = 'This is a secret message';
      const password = 'StrongPassword123!';
      const wrongPassword = 'WrongPassword456!';
      
      const encrypted = await encryptContent(content, password);
      
      await expect(
        decryptContent(encrypted.encrypted, wrongPassword, encrypted.salt, encrypted.iv)
      ).rejects.toThrow();
    });

    it('should generate different results with different salts', async () => {
      const content = 'This is a secret message';
      const password = 'StrongPassword123!';
      
      const encrypted1 = await encryptContent(content, password);
      const encrypted2 = await encryptContent(content, password);
      
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });
});
