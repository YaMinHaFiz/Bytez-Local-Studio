/**
 * useChat Hook
 * 
 * Custom hook to access the ChatContext.
 * Must be used within a ChatProvider.
 */

import { useContext } from 'react';
import { ChatContext } from './ChatContextDef.js';

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
