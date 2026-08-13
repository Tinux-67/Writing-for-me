/**
 * Security utilities for the Markdown Notes web app
 * Provides encryption, sanitization, and security validation
 *
 * Encryption is implemented entirely with the WebCrypto API
 * (window.crypto.subtle) using PBKDF2 + AES-GCM.
 */

import DOMPurify from 'dompurify';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a cryptographically secure random salt, returned as a hex string.
 * @param {number} [length=16] - Number of random bytes (hex output is 2x this length)
 * @returns {string} Hex-encoded random salt
 */
export function generateSalt(length = 16) {
  const salt = new Uint8Array(length);
  window.crypto.getRandomValues(salt);
  return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Convert a hex string to a Uint8Array.
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) {
    throw new Error('Invalid hex string');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert a Uint8Array to a base64 string (chunked to avoid call-stack limits).
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return window.btoa(binary);
}

/**
 * Convert a base64 string to a Uint8Array.
 * @param {string} base64
 * @returns {Uint8Array}
 */
function base64ToBytes(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive an AES-GCM CryptoKey from a password using PBKDF2 (SHA-256).
 * The key is never exported; it is returned as a non-extractable CryptoKey.
 * Internal use only.
 *
 * @param {string} password
 * @param {string} salt - Hex-encoded salt
 * @param {number} [iterations=100000]
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(password, salt, iterations = 100000) {
  const encoder = new TextEncoder();
  const saltBuffer = hexToBytes(salt);

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBuffer, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a UTF-8 string with AES-GCM using a key derived from the password.
 *
 * @migration Notes encrypted with the previous CryptoJS-based implementation
 * (CryptoJS.AES.encrypt with a hex-exported PBKDF2 key) CANNOT be decrypted
 * with this version. This implementation uses WebCrypto AES-GCM end-to-end
 * and produces a different, incompatible ciphertext format.
 *
 * @param {string} content - Plaintext content
 * @param {string} password
 * @returns {Promise<{encrypted: string, salt: string, iv: string}>}
 *   encrypted: base64-encoded ciphertext (incl. GCM auth tag);
 *   salt and iv: hex-encoded
 */
export async function encryptContent(content, password) {
  try {
    const salt = generateSalt();
    const iv = generateSalt(12); // 96-bit IV, recommended for AES-GCM
    const key = await deriveKey(password, salt);

    const encoder = new TextEncoder();
    const plaintext = encoder.encode(content);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: hexToBytes(iv) },
      key,
      plaintext
    );

    return {
      encrypted: bytesToBase64(new Uint8Array(ciphertext)),
      salt,
      iv
    };
  } catch (_error) {
    throw new Error('Failed to encrypt content');
  }
}

/**
 * Decrypt content previously encrypted with encryptContent.
 * Throws if the password is wrong or the data is corrupted/tampered
 * (AES-GCM authentication failure).
 *
 * @param {string} encrypted - Base64-encoded ciphertext
 * @param {string} password
 * @param {string} salt - Hex-encoded salt used for key derivation
 * @param {string} iv - Hex-encoded initialization vector
 * @returns {Promise<string>} Decrypted plaintext
 */
export async function decryptContent(encrypted, password, salt, iv) {
  try {
    const key = await deriveKey(password, salt);
    const ciphertext = base64ToBytes(encrypted);

    const plaintext = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBytes(iv) },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  } catch (_error) {
    throw new Error('Failed to decrypt content. Wrong password or corrupted data.');
  }
}

/**
 * Sanitize HTML using DOMPurify (html profile).
 * Removes scripts, event handlers, dangerous tags and attributes,
 * while preserving safe markup.
 *
 * @param {string} html
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

/**
 * Sanitize a filename by removing/replacing dangerous characters.
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  if (!filename) return 'untitled';
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\./, '_')
    .replace(/\/$/, '')
    .substring(0, 255);
}

/**
 * Validate and normalize a note title.
 * @param {string} title
 * @returns {string}
 */
export function validateTitle(title) {
  if (!title || title.trim() === '') return 'Untitled Note';
  return title.trim().substring(0, 200);
}

/**
 * Validate note content (enforces a maximum length).
 * @param {string} content
 * @returns {string}
 */
export function validateContent(content) {
  if (!content) return '';
  return content.substring(0, 1000000);
}

/**
 * Generate a random UUID v4.
 * @returns {string}
 */
export function generateId() {
  return uuidv4();
}

/**
 * Compute the SHA-256 hex digest of a string.
 * @param {string} str
 * @returns {Promise<string>}
 */
export async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate password strength.
 * @param {string} password
 * @returns {{valid: boolean, message: string}}
 */
export function validatePassword(password) {
  if (!password || password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return { valid: false, message: 'Password must contain at least one special character' };
  return { valid: true, message: 'Password is secure' };
}

export default {
  generateSalt,
  encryptContent,
  decryptContent,
  sanitizeHTML,
  sanitizeFilename,
  validateTitle,
  validateContent,
  generateId,
  hashString,
  validatePassword
};
