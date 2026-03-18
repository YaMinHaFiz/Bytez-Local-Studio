/**
 * ChatContext - Global state management for conversations
 * 
 * Provides conversation state and CRUD operations throughout the app.
 * Uses useReducer for predictable state transitions.
 */

import { useReducer, useCallback, useEffect } from 'react';
import { getConversations, saveConversations } from '../services/storage';
import { ChatContext } from './ChatContextDef.js';

function generateId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const initialState = {
    conversations: [],
    currentConversationId: null
};

function chatReducer(state, action) {
    switch (action.type) {
        case 'LOAD_CONVERSATIONS':
            return {
                ...state,
                conversations: action.payload
            };

        case 'CREATE_CONVERSATION': {
            const newConversation = {
                id: generateId(),
                title: action.payload.title || 'New Chat',
                createdAt: new Date().toISOString(),
                messages: action.payload.firstMessage ? [action.payload.firstMessage] : []
            };
            return {
                ...state,
                conversations: [newConversation, ...state.conversations],
                currentConversationId: newConversation.id
            };
        }

        case 'APPEND_MESSAGE': {
            const { conversationId, message } = action.payload;
            return {
                ...state,
                conversations: state.conversations.map(conv => {
                    if (conv.id === conversationId) {
                        return {
                            ...conv,
                            messages: [...conv.messages, message]
                        };
                    }
                    return conv;
                })
            };
        }

        case 'UPDATE_LAST_MESSAGE': {
            const { conversationId, content } = action.payload;
            return {
                ...state,
                conversations: state.conversations.map(conv => {
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
                })
            };
        }

        case 'SELECT_CONVERSATION':
            return {
                ...state,
                currentConversationId: action.payload
            };

        case 'CLEAR_CURRENT':
            return {
                ...state,
                currentConversationId: null
            };

        case 'DELETE_CONVERSATION': {
            const filtered = state.conversations.filter(conv => conv.id !== action.payload);
            return {
                ...state,
                conversations: filtered,
                currentConversationId: state.currentConversationId === action.payload 
                    ? null 
                    : state.currentConversationId
            };
        }

        case 'RENAME_CONVERSATION': {
            const { conversationId, newTitle } = action.payload;
            return {
                ...state,
                conversations: state.conversations.map(conv => {
                    if (conv.id === conversationId) {
                        return {
                            ...conv,
                            title: newTitle.trim() || 'New Chat'
                        };
                    }
                    return conv;
                })
            };
        }

        default:
            return state;
    }
}

export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState, () => ({
        ...initialState,
        conversations: getConversations()
    }));

    useEffect(() => {
        saveConversations(state.conversations);
    }, [state.conversations]);

    const createConversation = useCallback((title, firstMessage = null) => {
        const newConversation = {
            id: generateId(),
            title: title || 'New Chat',
            createdAt: new Date().toISOString(),
            messages: firstMessage ? [firstMessage] : []
        };
        dispatch({ type: 'CREATE_CONVERSATION', payload: { title, firstMessage } });
        return newConversation;
    }, []);

    const appendMessage = useCallback((conversationId, message) => {
        dispatch({ type: 'APPEND_MESSAGE', payload: { conversationId, message } });
    }, []);

    const updateLastMessage = useCallback((conversationId, content) => {
        dispatch({ type: 'UPDATE_LAST_MESSAGE', payload: { conversationId, content } });
    }, []);

    const getCurrentConversation = useCallback(() => {
        return state.conversations.find(c => c.id === state.currentConversationId) || null;
    }, [state.conversations, state.currentConversationId]);

    const selectConversation = useCallback((id) => {
        dispatch({ type: 'SELECT_CONVERSATION', payload: id });
    }, []);

    const clearCurrentConversation = useCallback(() => {
        dispatch({ type: 'CLEAR_CURRENT' });
    }, []);

    const deleteConversation = useCallback((conversationId) => {
        dispatch({ type: 'DELETE_CONVERSATION', payload: conversationId });
    }, []);

    const renameConversation = useCallback((conversationId, newTitle) => {
        dispatch({ type: 'RENAME_CONVERSATION', payload: { conversationId, newTitle } });
    }, []);

    const value = {
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
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
