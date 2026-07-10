/**
 * Test setup for Vitest
 */

import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest expect with jest-dom matchers
expect.extend(matchers);

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock IndexedDB
const indexedDBMock = {
  open: () => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  }),
  deleteDatabase: () => ({}),
  cmp: () => 0
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock
});

// Mock crypto
const cryptoMock = {
  getRandomValues: (array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {
    digest: async (algorithm, data) => {
      // Simple mock for SHA-256
      const hash = new Uint8Array(32);
      for (let i = 0; i < hash.length; i++) {
        hash[i] = Math.floor(Math.random() * 256);
      }
      return hash;
    },
    importKey: async () => ({}),
    deriveKey: async () => ({}),
    exportKey: async () => new Uint8Array(32)
  }
};

Object.defineProperty(window, 'crypto', {
  value: cryptoMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {}
  })
});

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  localStorage.clear();
});

afterEach(() => {
  // Clean up after each test
  localStorage.clear();
});

export default {
  localStorageMock,
  indexedDBMock,
  cryptoMock
};
