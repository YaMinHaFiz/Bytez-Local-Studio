/**
 * ChatContext - Global state management for conversations
 * 
 * Provides conversation state and CRUD operations throughout the app.
 * Replaces prop drilling between App, ChatWindow, and Sidebar.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getConversations,
  saveConversations
} from '../services/storage';
import { ChatContext } from './ChatContextDef.js';

// Generate a unique ID for conversations
function generateId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function ChatProvider({ children }) {
  // Conversations list
  const [conversations, setConversations] = useState(() => getConversations());
  
  // Current selected conversation ID
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Persist to localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Create a new conversation and return its ID
  const createConversation = useCallback((title, firstMessage = null) => {
    const newConversation = {
      id: generateId(),
      title: title || 'New Chat',
      createdAt: new Date().toISOString(),
      messages: firstMessage ? [firstMessage] : []
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);

    return newConversation;
  }, []);

  // Append a message to a conversation
  const appendMessage = useCallback((conversationId, message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, message]
        };
      }
      return conv;
    }));
  }, []);

  // Update the last message in a conversation (for streaming)
  const updateLastMessage = useCallback((conversationId, content) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const messages = [...conv.messages];
        if (messages.length > 0) {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content
          };
        }
        return { ...conv, messages };
      }
      return conv;
    }));
  }, []);

  // Get current conversation object
  const getCurrentConversation = useCallback(() => {
    return conversations.find(c => c.id === currentConversationId) || null;
  }, [conversations, currentConversationId]);

  // Select a conversation
  const selectConversation = useCallback((id) => {
    setCurrentConversationId(id);
  }, []);

  // Clear current conversation (start new chat)
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversationId(null);
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback((conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    // If we deleted the current conversation, clear the selection
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  // Rename a conversation
  const renameConversation = useCallback((conversationId, newTitle) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          title: newTitle.trim() || 'New Chat'
        };
      }
      return conv;
    }));
  }, []);

  const value = {
    conversations,
    currentConversationId,
    createConversation,
    appendMessage,
    updateLastMessage,
    getCurrentConversation,
    selectConversation,
    clearCurrentConversation,
    deleteConversation,
    renameConversation
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}


