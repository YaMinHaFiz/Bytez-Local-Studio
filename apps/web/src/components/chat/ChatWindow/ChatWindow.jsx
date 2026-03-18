/**
 * ChatWindow Component
 *
 * Core chat interface with real-time streaming, constrained layout,
 * and room for the floating input capsule at the bottom.
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import MessageBubble from '../MessageBubble/MessageBubble';
import ChatInput from '../ChatInput/ChatInput';
import EmptyState from '../EmptyState/EmptyState';
import { streamChat } from '../../../services/bytez';

function generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function ChatWindow({
    conversationId,
    modelId,
    systemPrompt,
    apiKey,
    onConversationCreated,
    createConversation,
    appendMessage,
    getCurrentConversation,
}) {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [streamingContent, setStreamingContent] = useState('');

    const messagesEndRef = useRef(null);
    const abortControllerRef = useRef(null);

    const currentConversation = getCurrentConversation();
    const messages = useMemo(() => currentConversation?.messages || [], [currentConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    useEffect(() => {
        setStreamingContent('');
        setError(null);
    }, [conversationId]);

    const handleSuggestionClick = (prompt) => {
        setInput(prompt);
        setTimeout(() => sendMessage(prompt), 100);
    };

    const sendMessage = useCallback(async (overrideInput = null) => {
        const textToSend = overrideInput || input;
        
        if (!textToSend.trim() || isLoading) {
            return;
        }

        if (!apiKey) {
            setError('Please configure your Bytez API key in Settings first.');
            return;
        }

        setError(null);
        const userInput = textToSend.trim();
        const userMessage = { id: generateMessageId(), role: 'user', content: userInput };
        setInput('');
        setStreamingContent('');

        let activeConversationId = conversationId;
        
        if (!activeConversationId) {
            const title = userInput.length > 50 ? userInput.substring(0, 50) + '...' : userInput;
            const newConversation = createConversation(title, userMessage);
            activeConversationId = newConversation.id;
            onConversationCreated(newConversation);
        } else {
            appendMessage(activeConversationId, userMessage);
        }

        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            const apiMessages = [];

            if (systemPrompt?.trim()) {
                apiMessages.push({ role: 'system', content: systemPrompt.trim() });
            }

            const conversationMessages =
                activeConversationId === conversationId
                    ? [...messages, userMessage]
                    : [userMessage];
            
            conversationMessages.forEach((m) => {
                apiMessages.push({ role: m.role, content: m.content });
            });

            let fullResponse = '';

            await streamChat({
                apiKey,
                modelId,
                messages: apiMessages,
                temperature: 0.7,
                signal: abortControllerRef.current.signal,
                onToken: (token) => {
                    fullResponse += token;
                    setStreamingContent(fullResponse);
                },
                onError: (err) => {
                    setError(err.message || 'Stream error occurred');
                },
                onComplete: (finalText) => {
                    appendMessage(activeConversationId, {
                        id: generateMessageId(),
                        role: 'assistant',
                        content: finalText,
                    });
                    setStreamingContent('');
                },
            });
        } catch (err) {
            if (err.name === 'AbortError') {
                // User cancelled - this is expected
            } else {
                setError(err.message || 'Failed to get response from AI');
            }
            setStreamingContent('');
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [input, isLoading, apiKey, conversationId, messages, systemPrompt, modelId, createConversation, onConversationCreated, appendMessage]);

    const handleCancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const handleRetry = useCallback(async () => {
        if (!conversationId || isLoading) return;

        const lastUserMessageIndex = messages.length - 1;
        if (lastUserMessageIndex < 0) return;

        const lastUserMessage = messages[lastUserMessageIndex];
        if (lastUserMessage.role !== 'user') return;

        await sendMessage(lastUserMessage.content);
    }, [conversationId, isLoading, messages, sendMessage]);

    const displayMessages = streamingContent
        ? [...messages, { id: 'streaming', role: 'assistant', content: streamingContent }]
        : messages;

    if (displayMessages.length === 0 && !isLoading) {
        return (
            <div className="flex-1 flex flex-col relative min-h-0 bg-zinc-950">
                <EmptyState onSuggestionClick={handleSuggestionClick} />

                {error && <ErrorBanner error={error} />}

                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={() => sendMessage()}
                    isLoading={isLoading}
                    disabled={!apiKey}
                />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col relative min-h-0 bg-zinc-950">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                <div className="max-w-3xl mx-auto py-6 pb-4">
                    {displayMessages.map((message) => (
                        <MessageBubble
                            key={message.id || message.content.substring(0, 20)}
                            role={message.role}
                            content={message.content}
                            onRetry={message.role === 'assistant' && !streamingContent ? handleRetry : undefined}
                            isRetrying={isLoading && message.role === 'assistant'}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {error && <ErrorBanner error={error} />}

            <ChatInput
                value={input}
                onChange={setInput}
                onSubmit={() => sendMessage()}
                onCancel={isLoading ? handleCancel : undefined}
                isLoading={isLoading}
                disabled={!apiKey}
            />
        </div>
    );
}

function ErrorBanner({ error }) {
    return (
        <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2.5 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                </div>
            </div>
        </div>
    );
}
