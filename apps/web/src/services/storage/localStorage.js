/**
 * Storage Utilities - Browser localStorage Persistence Layer
 * 
 * Handles all data persistence for:
 * - Conversations (chat history)
 * - API Key
 * - System Prompt
 * - Custom Models
 * 
 * All data is stored locally in the browser and survives page refreshes.
 */

const STORAGE_KEYS = {
    CONVERSATIONS: 'bytez_conversations',
    API_KEY: 'bytez_api_key',
    SYSTEM_PROMPT: 'bytez_system_prompt',
    CUSTOM_MODELS: 'bytez_custom_models'
};

let storageErrorCallback = null;

export function setStorageErrorHandler(callback) {
    storageErrorCallback = callback;
}

function handleStorageError(error, operation) {
    console.error(`Storage error during ${operation}:`, error);
    
    if (error.name === 'QuotaExceededError' || 
        (error.message && error.message.includes('quota'))) {
        if (storageErrorCallback) {
            storageErrorCallback({
                type: 'quota_exceeded',
                message: 'Storage limit exceeded. Please delete some old conversations to free up space.'
            });
        }
    }
    
    throw error;
}

export function getConversations() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        if (!data) return [];
        
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];
        
        return parsed;
    } catch (error) {
        console.error('Error loading conversations:', error);
        return [];
    }
}

export function saveConversations(conversations) {
    try {
        const dataSize = new Blob([JSON.stringify(conversations)]).size;
        const maxSize = 5 * 1024 * 1024;
        
        if (dataSize > maxSize) {
            throw new Error('Data size exceeds storage limit');
        }
        
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
        handleStorageError(error, 'saving conversations');
    }
}

export function getAPIKey() {
    try {
        return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    } catch (error) {
        console.error('Error loading API key:', error);
        return '';
    }
}

export function saveAPIKey(key) {
    try {
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } catch (error) {
        handleStorageError(error, 'saving API key');
    }
}

export function getSystemPrompt() {
    try {
        return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || '';
    } catch (error) {
        console.error('Error loading system prompt:', error);
        return '';
    }
}

export function saveSystemPrompt(prompt) {
    try {
        localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, prompt);
    } catch (error) {
        handleStorageError(error, 'saving system prompt');
    }
}

export function getCustomModels() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_MODELS);
        if (!data) return [];
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        console.error('Error loading custom models:', error);
        return [];
    }
}

export function saveCustomModels(models) {
    try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models));
    } catch (error) {
        handleStorageError(error, 'saving custom models');
    }
}

export function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
        localStorage.removeItem(STORAGE_KEYS.SYSTEM_PROMPT);
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_MODELS);
    } catch (error) {
        handleStorageError(error, 'clearing all data');
    }
}

export function exportData() {
    return {
        conversations: getConversations(),
        customModels: getCustomModels(),
        exportedAt: new Date().toISOString(),
        version: 1
    };
}

export function importData(data) {
    try {
        if (data.conversations && Array.isArray(data.conversations)) {
            saveConversations(data.conversations);
        }
        if (data.customModels && Array.isArray(data.customModels)) {
            saveCustomModels(data.customModels);
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export { STORAGE_KEYS };
