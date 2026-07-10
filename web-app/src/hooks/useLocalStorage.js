/**
 * Custom hook for managing localStorage with React state
 */

import { useState, useEffect } from 'react';

/**
 * Use localStorage state
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function]} State and setter
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error('Error saving to localStorage:', error);
    }
  };

  // Handle window storage events (sync across tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}

/**
 * Use sessionStorage state
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {[*, Function]} State and setter
 */
export function useSessionStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Use debounced localStorage state
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @param {number} delay - Debounce delay in ms
 * @returns {[*, Function]} State and setter
 */
export function useDebouncedLocalStorage(key, initialValue, delay = 500) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Debounce the setter
  const debouncedSetValue = (value) => {
    let timeoutId;
    return (newValue) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const valueToStore = newValue instanceof Function ? newValue(storedValue) : newValue;
          setStoredValue(valueToStore);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      }, delay);
    };
  };

  const setValue = useCallback(debouncedSetValue, [key, delay]);

  return [storedValue, setValue];
}

// Re-export for convenience
import { useCallback } from 'react';

export default {
  useLocalStorage,
  useSessionStorage,
  useDebouncedLocalStorage
};
