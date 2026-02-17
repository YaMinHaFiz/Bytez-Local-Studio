/**
 * Storage Utilities - Browser localStorage Persistence Layer
 * 
 * Handles all data persistence for:
 * - Conversations (chat history)
 * - API Key
 * - System Prompt
 * 
 * All data is stored locally in the browser and survives page refreshes.
 */

const STORAGE_KEYS = {
    CONVERSATIONS: 'bytez_conversations',
    API_KEY: 'bytez_api_key',
    SYSTEM_PROMPT: 'bytez_system_prompt',
    CUSTOM_MODELS: 'bytez_custom_models'
};

/**
 * Handle storage errors gracefully (e.g., quota exceeded)
 * @param {Error} error - The error object
 * @param {string} operation - Description of the operation that failed
 */
function handleStorageError(error, operation) {
    console.error(`Storage error during ${operation}:`, error);
    
    if (error.name === 'QuotaExceededError' || 
        (error.message && error.message.includes('quota'))) {
        alert(
            'Storage limit exceeded. Please delete some old conversations ' +
            'to free up space, or clear your browser data.'
        );
    }
    
    // Re-throw so caller can handle if needed
    throw error;
}

/**
 * Retrieve all conversations from localStorage
 * @returns {Array} Array of conversation objects
 */
export function getConversations() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        if (!data) return [];
        
        const parsed = JSON.parse(data);
        // Validate that it's an array
        if (!Array.isArray(parsed)) return [];
        
        return parsed;
    } catch (error) {
        console.error('Error loading conversations:', error);
        return [];
    }
}

/**
 * Persist all conversations to localStorage
 * @param {Array} conversations - Array of conversation objects
 */
export function saveConversations(conversations) {
    try {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
        handleStorageError(error, 'saving conversations');
    }
}

/**
 * Retrieve stored API key from localStorage
 * @returns {string} The stored API key or empty string
 */
export function getAPIKey() {
    try {
        return localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    } catch (error) {
        console.error('Error loading API key:', error);
        return '';
    }
}

/**
 * Persist API key to localStorage
 * @param {string} key - The API key to store
 */
export function saveAPIKey(key) {
    try {
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    } catch (error) {
        handleStorageError(error, 'saving API key');
    }
}

/**
 * Retrieve stored system prompt from localStorage
 * @returns {string} The stored system prompt or empty string
 */
export function getSystemPrompt() {
    try {
        return localStorage.getItem(STORAGE_KEYS.SYSTEM_PROMPT) || '';
    } catch (error) {
        console.error('Error loading system prompt:', error);
        return '';
    }
}

/**
 * Persist system prompt to localStorage
 * @param {string} prompt - The system prompt to store
 */
export function saveSystemPrompt(prompt) {
    try {
        localStorage.setItem(STORAGE_KEYS.SYSTEM_PROMPT, prompt);
    } catch (error) {
        handleStorageError(error, 'saving system prompt');
    }
}

/**
 * Retrieve custom models from localStorage
 * @returns {Array} Array of {id, name} objects
 */
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

/**
 * Persist custom models to localStorage
 * @param {Array} models - Array of {id, name} objects
 */
export function saveCustomModels(models) {
    try {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_MODELS, JSON.stringify(models));
    } catch (error) {
        handleStorageError(error, 'saving custom models');
    }
}

/**
 * Wipe all stored data from localStorage
 * Use with caution - this will delete all conversations and settings
 */
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

/**
 * Export storage keys for advanced use cases
 */
export { STORAGE_KEYS };
