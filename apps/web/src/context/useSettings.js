/**
 * useSettings Hook
 * 
 * Custom hook to access the SettingsContext.
 * Must be used within a SettingsProvider.
 */

import { useContext } from 'react';
import { SettingsContext } from './SettingsContextDef.js';

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
