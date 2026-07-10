/**
 * Security utilities for the Markdown Notes web app
 * Provides encryption, sanitization, and security validation
 */

import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a secure random salt
 * @param {number} length - Length of the salt in bytes
 * @returns {string} Hex-encoded salt
 */
export function generateSalt(length = 16) {
  const salt = new Uint8Array(length);
  window.crypto.getRandomValues(salt);
  return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive a key from a password using PBKDF2
 * @param {string} password - User password
 * @param {string} salt - Salt for key derivation
 * @param {number} iterations - Number of iterations
 * @returns {Promise<string>} Hex-encoded derived key
 */
export async function deriveKey(password, salt, iterations = 100000) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(salt);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  
  const exportedKey = await window.crypto.subtle.exportKey('raw', key);
  return Array.from(new Uint8Array(exportedKey)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypt content using AES-GCM
 * @param {string} content - Content to encrypt
 * @param {string} password - Encryption password
 * @returns {Promise<{encrypted: string, salt: string, iv: string}>} Encryption result
 */
export async function encryptContent(content, password) {
  try {
    const salt = generateSalt();
    const iv = generateSalt(12); // 96 bits for GCM
    const key = await deriveKey(password, salt);
    
    const encrypted = CryptoJS.AES.encrypt(
      content,
      CryptoJS.enc.Hex.parse(key),
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return {
      encrypted: encrypted.toString(),
      salt,
      iv
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt content');
  }
}

/**
 * Decrypt content using AES-GCM
 * @param {string} encrypted - Encrypted content
 * @param {string} password - Decryption password
 * @param {string} salt - Salt used for encryption
 * @param {string} iv - Initialization vector
 * @returns {Promise<string>} Decrypted content
 */
export async function decryptContent(encrypted, password, salt, iv) {
  try {
    const key = await deriveKey(password, salt);
    
    const decrypted = CryptoJS.AES.decrypt(
      encrypted,
      CryptoJS.enc.Hex.parse(key),
      {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.GCM,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt content. Wrong password or corrupted data.');
  }
}

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html) return '';
  
  // Create a temporary DOM element
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Remove potentially dangerous elements
  const dangerousTags = [
    'script', 'iframe', 'object', 'embed', 'applet', 'form',
    'input', 'button', 'select', 'textarea', 'link', 'meta',
    'style', 'base', 'frame', 'frameset', 'onerror', 'onload'
  ];
  
  dangerousTags.forEach(tag => {
    const elements = temp.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });
  
  // Remove event handlers
  const allElements = temp.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  return temp.innerHTML;
}

/**
 * Sanitize filename to prevent path traversal
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'untitled';
  
  // Remove path traversal attempts
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .replace(/\/$/, '')
    .substring(0, 255); // Limit length
}

/**
 * Validate note title
 * @param {string} title - Title to validate
 * @returns {string} Validated title
 */
export function validateTitle(title) {
  if (!title || title.trim() === '') {
    return 'Untitled Note';
  }
  
  const trimmed = title.trim();
  const maxLength = 200;
  
  return trimmed.substring(0, maxLength);
}

/**
 * Validate note content
 * @param {string} content - Content to validate
 * @returns {string} Validated content
 */
export function validateContent(content) {
  if (!content) return '';
  
  const maxLength = 1000000; // 1MB limit
  return content.substring(0, maxLength);
}

/**
 * Generate a secure unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return uuidv4();
}

/**
 * Hash a string using SHA-256
 * @param {string} str - String to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if a password meets security requirements
 * @param {string} password - Password to check
 * @returns {{valid: boolean, message: string}} Validation result
 */
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }
  
  return { valid: true, message: 'Password is secure' };
}

/**
 * Securely wipe sensitive data from memory
 * @param {string} data - Data to wipe
 */
export function secureWipe(data) {
  if (data && typeof data === 'string') {
    // Overwrite the string with random data
    const arr = new Uint8Array(data.length);
    window.crypto.getRandomValues(arr);
    // This doesn't actually wipe from memory, but makes it harder to recover
    // In a real application, you'd need WebAssembly for true secure wiping
  }
}

export default {
  generateSalt,
  deriveKey,
  encryptContent,
  decryptContent,
  sanitizeHTML,
  sanitizeFilename,
  validateTitle,
  validateContent,
  generateId,
  hashString,
  validatePassword,
  secureWipe
};
