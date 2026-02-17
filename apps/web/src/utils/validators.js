/**
 * Validation Utilities
 */

/**
 * Validate an API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Whether the key is valid
 */
export function isValidApiKey(apiKey) {
  return typeof apiKey === 'string' && apiKey.trim().length > 0;
}

/**
 * Validate a message is not empty
 * @param {string} message - Message to validate
 * @returns {boolean} Whether the message is valid
 */
export function isValidMessage(message) {
  return typeof message === 'string' && message.trim().length > 0;
}

/**
 * Validate a model ID format
 * @param {string} modelId - Model ID to validate
 * @returns {boolean} Whether the model ID is valid
 */
export function isValidModelId(modelId) {
  return typeof modelId === 'string' && modelId.includes('/');
}
