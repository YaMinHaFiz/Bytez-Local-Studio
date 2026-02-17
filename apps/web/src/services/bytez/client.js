/**
 * Bytez Client - Direct Browser API Integration
 * 
 * Streams chat responses directly from the Bytez REST API.
 * No backend required - runs entirely in the browser.
 * 
 * SECURITY NOTE: API key is passed per-request, never stored or logged.
 */

const BYTEZ_API_BASE = 'https://api.bytez.com';

/**
 * Stream a chat completion from the Bytez API.
 * 
 * @param {Object} options - Request options
 * @param {string} options.apiKey - Bytez API key
 * @param {string} options.modelId - Model identifier (e.g. 'google/gemma-2-9b-it')
 * @param {Array} options.messages - Array of message objects with role and content
 * @param {number} [options.temperature=0.7] - Sampling temperature
 * @param {AbortSignal} [options.signal] - AbortController signal for cancellation
 * @param {Function} options.onToken - Callback for each streamed token
 * @param {Function} [options.onError] - Callback for errors
 * @param {Function} [options.onComplete] - Callback when stream completes
 * @returns {Promise<string>} - Complete response text
 */
export async function streamChat({
    apiKey,
    modelId,
    messages,
    temperature = 0.7,
    signal,
    onToken,
    onError,
    onComplete
}) {
    console.log('[Bytez Client] Starting streamChat with model:', modelId);
    console.log('[Bytez Client] Messages count:', messages?.length);
    
    if (!apiKey) {
        throw new Error('API key is required');
    }

    if (!modelId) {
        throw new Error('Model ID is required');
    }

    if (!messages || messages.length === 0) {
        throw new Error('Messages array is required');
    }

    // Build the API endpoint URL
    const url = `${BYTEZ_API_BASE}/models/v2/${encodeURIComponent(modelId)}`;
    console.log('[Bytez Client] API URL:', url);

    // Build request body matching Bytez SDK format
    const body = {
        input: messages,
        params: {
            temperature
        },
        stream: true
    };
    
    console.log('[Bytez Client] Request body:', JSON.stringify(body, null, 2));

    try {
        console.log('[Bytez Client] Sending fetch request...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body),
            signal
        });
        
        console.log('[Bytez Client] Response status:', response.status);

        if (!response.ok) {
            let errorMessage;
            // Clone response before reading to avoid "body stream already read" error
            const responseClone = response.clone();
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
            } catch {
                errorMessage = await responseClone.text() || `HTTP ${response.status}`;
            }
            console.error('[Bytez Client] API Error:', errorMessage);
            throw new Error(errorMessage);
        }

        // Process streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = ''; // Buffer for incomplete SSE lines

        console.log('[Bytez Client] Starting to read stream...');

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                console.log('[Bytez Client] Stream complete');
                break;
            }

            // Decode the chunk
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // Process complete lines from buffer
            const lines = buffer.split('\n');
            // Keep the last line in buffer if it's incomplete (no newline at end)
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Skip empty lines
                if (!trimmedLine) continue;
                
                // Handle SSE format: data: {...}
                if (trimmedLine.startsWith('data:')) {
                    const data = trimmedLine.slice(5).trim();
                    
                    // Skip [DONE] marker
                    if (data === '[DONE]') {
                        console.log('[Bytez Client] Received [DONE] marker');
                        continue;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        
                        // Try multiple possible response formats
                        let token = '';
                        
                        // OpenAI-compatible format
                        if (parsed.choices?.[0]?.delta?.content) {
                            token = parsed.choices[0].delta.content;
                        }
                        // Direct content format
                        else if (parsed.content) {
                            token = parsed.content;
                        }
                        // Token format
                        else if (parsed.token) {
                            token = parsed.token;
                        }
                        // Text format
                        else if (parsed.text) {
                            token = parsed.text;
                        }
                        // Message format
                        else if (parsed.message?.content) {
                            token = parsed.message.content;
                        }
                        // Response format
                        else if (parsed.response) {
                            token = parsed.response;
                        }
                        // Output format
                        else if (parsed.output) {
                            token = parsed.output;
                        }
                        
                        if (token && token.length > 0) {
                            fullText += token;
                            if (onToken) onToken(token);
                        }
                    } catch {
                        // If not valid JSON, treat as plain text (some APIs send raw text)
                        if (data && data !== '[DONE]') {
                            console.log('[Bytez Client] Non-JSON data received:', data.substring(0, 100));
                            fullText += data;
                            if (onToken) onToken(data);
                        }
                    }
                } else if (trimmedLine.startsWith('event:') || trimmedLine.startsWith('id:') || trimmedLine.startsWith(':')) {
                    // SSE metadata lines - skip them
                    continue;
                } else {
                    // Plain text line (not SSE format)
                    if (trimmedLine) {
                        console.log('[Bytez Client] Plain text line:', trimmedLine.substring(0, 50));
                        fullText += trimmedLine + '\n';
                        if (onToken) onToken(trimmedLine + '\n');
                    }
                }
            }
        }
        
        // Process any remaining data in buffer
        if (buffer.trim()) {
            const trimmedBuffer = buffer.trim();
            if (trimmedBuffer.startsWith('data:')) {
                const data = trimmedBuffer.slice(5).trim();
                if (data && data !== '[DONE]') {
                    try {
                        const parsed = JSON.parse(data);
                        let token = parsed.choices?.[0]?.delta?.content || 
                                   parsed.content || 
                                   parsed.token || 
                                   parsed.text || 
                                   parsed.message?.content || 
                                   parsed.response || 
                                   parsed.output || '';
                        if (token) {
                            fullText += token;
                            if (onToken) onToken(token);
                        }
                    } catch {
                        fullText += data;
                        if (onToken) onToken(data);
                    }
                }
            }
        }

        console.log('[Bytez Client] Final response length:', fullText.length);
        
        if (onComplete) onComplete(fullText);
        return fullText;

    } catch (err) {
        if (err.name === 'AbortError') {
            console.log('[Bytez Client] Request aborted by user');
            throw err;
        }

        console.error('[Bytez Client] Error:', err);
        if (onError) onError(err);
        throw err;
    }
}

/**
 * Check if the Bytez API is reachable (basic connectivity test).
 * This does NOT validate the API key.
 * 
 * @returns {Promise<boolean>} - True if API is reachable
 */
export async function checkApiReachable() {
    try {
        await fetch(BYTEZ_API_BASE, {
            method: 'HEAD',
            mode: 'no-cors' // Just check if we can reach the server
        });
        return true;
    } catch {
        return false;
    }
}
