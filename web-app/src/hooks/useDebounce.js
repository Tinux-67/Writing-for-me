/**
 * Custom hook for debouncing values
 */

import { useState, useEffect } from 'react';

/**
 * Debounce a value
 * @param {*} value - Value to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {*} Debounced value
 */
export function useDebounce(value, delay) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time ...
    // ... useEffect is re-called. useEffect will only be re-called ...
    // ... if value or delay changes (see the inputs array below).
    // This is how we prevent debouncedValue from changing if value is ...
    // ... changed within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} Debounced function
 */
export function useDebouncedFunction(func, delay) {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedFunction = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      func(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedFunction;
}

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in ms
 * @returns {Function} Throttled function
 */
export function useThrottle(func, limit) {
  const [lastRan, setLastRan] = useState(0);

  const throttledFunction = (...args) => {
    const now = Date.now();
    if (now - lastRan >= limit) {
      func(...args);
      setLastRan(now);
    }
  };

  return throttledFunction;
}

export default {
  useDebounce,
  useDebouncedFunction,
  useThrottle
};
