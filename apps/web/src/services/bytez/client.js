/**
 * Bytez Client - Direct Browser API Integration
 * 
 * Streams chat responses directly from the Bytez REST API.
 * No backend required - runs entirely in the browser.
 */

const BYTEZ_API_BASE = 'https://api.bytez.com';
const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: options.signal || controller.signal
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

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
    if (!apiKey) {
        throw new Error('API key is required');
    }

    if (!modelId) {
        throw new Error('Model ID is required');
    }

    if (!messages || messages.length === 0) {
        throw new Error('Messages array is required');
    }

    const url = `${BYTEZ_API_BASE}/models/v2/${encodeURIComponent(modelId)}`;

    const body = {
        input: messages,
        params: {
            temperature
        },
        stream: true
    };

    let lastError;
    
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            await sleep(RETRY_DELAY * Math.pow(2, attempt - 1));
        }

        try {
            const response = await fetchWithTimeout(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body),
                signal
            }, DEFAULT_TIMEOUT);
            
            if (!response.ok) {
                let errorMessage;
                const responseClone = response.clone();
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
                } catch {
                    errorMessage = await responseClone.text() || `HTTP ${response.status}`;
                }
                throw new Error(errorMessage);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                buffer += chunk;
                
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    const trimmedLine = line.trim();
                    
                    if (!trimmedLine) continue;
                    
                    if (trimmedLine.startsWith('data:')) {
                        const data = trimmedLine.slice(5).trim();
                        
                        if (data === '[DONE]') {
                            continue;
                        }
                        
                        try {
                            const parsed = JSON.parse(data);
                            let token = '';
                            
                            if (parsed.choices?.[0]?.delta?.content) {
                                token = parsed.choices[0].delta.content;
                            } else if (parsed.content) {
                                token = parsed.content;
                            } else if (parsed.token) {
                                token = parsed.token;
                            } else if (parsed.text) {
                                token = parsed.text;
                            } else if (parsed.message?.content) {
                                token = parsed.message.content;
                            } else if (parsed.response) {
                                token = parsed.response;
                            } else if (parsed.output) {
                                token = parsed.output;
                            }
                            
                            if (token && token.length > 0) {
                                fullText += token;
                                if (onToken) onToken(token);
                            }
                        } catch {
                            if (data && data !== '[DONE]') {
                                fullText += data;
                                if (onToken) onToken(data);
                            }
                        }
                    } else if (trimmedLine.startsWith('event:') || trimmedLine.startsWith('id:') || trimmedLine.startsWith(':')) {
                        continue;
                    } else {
                        if (trimmedLine) {
                            fullText += trimmedLine + '\n';
                            if (onToken) onToken(trimmedLine + '\n');
                        }
                    }
                }
            }
            
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
            
            if (onComplete) onComplete(fullText);
            return fullText;

        } catch (err) {
            lastError = err;
            
            if (err.name === 'AbortError') {
                throw err;
            }
            
            if (onError) onError(err);
        }
    }

    throw lastError || new Error('Request failed after retries');
}

export async function checkApiReachable() {
    try {
        await fetch(BYTEZ_API_BASE, {
            method: 'HEAD',
            mode: 'no-cors'
        });
        return true;
    } catch {
        return false;
    }
}
