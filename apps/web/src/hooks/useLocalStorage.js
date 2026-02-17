/**
 * useLocalStorage Hook
 * 
 * Custom hook for synchronizing state with localStorage.
 * Handles JSON serialization/deserialization and errors gracefully.
 */

import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
      
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        alert(
          'Storage limit exceeded. Please delete some old conversations ' +
          'to free up space, or clear your browser data.'
        );
      }
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
