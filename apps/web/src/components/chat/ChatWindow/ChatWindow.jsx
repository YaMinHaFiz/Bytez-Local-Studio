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

    // Get messages from current conversation
    const currentConversation = getCurrentConversation();
    const messages = useMemo(() => currentConversation?.messages || [], [currentConversation]);
    
    console.log('[ChatWindow] Render - conversationId:', conversationId);
    console.log('[ChatWindow] Render - messages count:', messages.length);
    console.log('[ChatWindow] Render - apiKey present:', !!apiKey);
    console.log('[ChatWindow] Render - modelId:', modelId);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    // Clear streaming content on conversation change
    useEffect(() => {
        setStreamingContent('');
        setError(null);
    }, [conversationId]);

    // Handle suggestion click from EmptyState
    const handleSuggestionClick = (prompt) => {
        console.log('[ChatWindow] Suggestion clicked:', prompt);
        setInput(prompt);
        // Auto-send the suggestion
        setTimeout(() => sendMessage(prompt), 100);
    };

    // Main send
    const sendMessage = useCallback(async (overrideInput = null) => {
        const textToSend = overrideInput || input;
        console.log('[ChatWindow] sendMessage called with:', textToSend?.substring(0, 50));
        console.log('[ChatWindow] isLoading:', isLoading);
        console.log('[ChatWindow] apiKey present:', !!apiKey);
        
        if (!textToSend.trim() || isLoading) {
            console.log('[ChatWindow] Early return - empty text or already loading');
            return;
        }

        if (!apiKey) {
            console.error('[ChatWindow] No API key configured');
            setError('Please configure your Bytez API key in Settings first.');
            return;
        }

        setError(null);
        const userInput = textToSend.trim();
        const userMessage = { role: 'user', content: userInput };
        setInput('');
        setStreamingContent('');

        let activeConversationId = conversationId;
        console.log('[ChatWindow] Current conversationId:', conversationId);
        
        if (!activeConversationId) {
            console.log('[ChatWindow] Creating new conversation...');
            const title =
                userInput.length > 50 ? userInput.substring(0, 50) + '...' : userInput;
            const newConversation = createConversation(title, userMessage);
            activeConversationId = newConversation.id;
            console.log('[ChatWindow] New conversation created:', activeConversationId);
            onConversationCreated(newConversation);
        } else {
            console.log('[ChatWindow] Appending to existing conversation:', activeConversationId);
            appendMessage(activeConversationId, userMessage);
        }

        setIsLoading(true);
        abortControllerRef.current = new AbortController();

        try {
            const apiMessages = [];

            if (systemPrompt?.trim()) {
                console.log('[ChatWindow] Adding system prompt');
                apiMessages.push({ role: 'system', content: systemPrompt.trim() });
            }

            const conversationMessages =
                activeConversationId === conversationId
                    ? [...messages, userMessage]
                    : [userMessage];
            
            console.log('[ChatWindow] Total messages to send:', conversationMessages.length + (systemPrompt ? 1 : 0));

            conversationMessages.forEach((m) => {
                apiMessages.push({ role: m.role, content: m.content });
            });

            let fullResponse = '';
            let tokenCount = 0;

            console.log('[ChatWindow] Calling streamChat...');
            await streamChat({
                apiKey,
                modelId,
                messages: apiMessages,
                temperature: 0.7,
                signal: abortControllerRef.current.signal,
                onToken: (token) => {
                    tokenCount++;
                    if (tokenCount <= 5 || tokenCount % 50 === 0) {
                        console.log(`[ChatWindow] Token ${tokenCount} received:`, token?.substring(0, 30));
                    }
                    fullResponse += token;
                    setStreamingContent(fullResponse);
                },
                onError: (err) => {
                    console.error('[ChatWindow] Stream error:', err);
                },
                onComplete: (finalText) => {
                    console.log('[ChatWindow] Stream complete. Final text length:', finalText?.length);
                    appendMessage(activeConversationId, {
                        role: 'assistant',
                        content: finalText,
                    });
                    setStreamingContent('');
                },
            });
            console.log('[ChatWindow] streamChat completed successfully');
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('[ChatWindow] Request aborted by user');
            } else {
                console.error('[ChatWindow] Streaming error:', err);
                console.error('[ChatWindow] Error stack:', err.stack);
                setError(err.message || 'Failed to get response from AI');
            }
            setStreamingContent('');
        } finally {
            console.log('[ChatWindow] Cleaning up...');
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [input, isLoading, apiKey, conversationId, messages, systemPrompt, modelId, createConversation, onConversationCreated, appendMessage]);

    const handleCancel = useCallback(() => {
        console.log('[ChatWindow] Cancel requested');
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // Handle retry - regenerate the last assistant response
    const handleRetry = useCallback(async () => {
        if (!conversationId || isLoading) return;

        // Find the last user message before the current assistant message
        const lastUserMessageIndex = messages.length - 1;
        if (lastUserMessageIndex < 0) return;

        const lastUserMessage = messages[lastUserMessageIndex];
        if (lastUserMessage.role !== 'user') return;

        console.log('[ChatWindow] Retrying for message:', lastUserMessage.content.substring(0, 50));

        // Remove the last assistant message if it exists
        const conversation = getCurrentConversation();
        if (conversation && conversation.messages.length > 0) {
            const lastMsg = conversation.messages[conversation.messages.length - 1];
            if (lastMsg.role === 'assistant') {
                // Remove the last assistant message
                // Note: We need to add a method to update messages or handle this differently
                // For now, we'll just regenerate without removing
            }
        }

        // Resend the message
        await sendMessage(lastUserMessage.content);
    }, [conversationId, isLoading, messages, getCurrentConversation, sendMessage]);

    const displayMessages = streamingContent
        ? [...messages, { role: 'assistant', content: streamingContent }]
        : messages;

    // ─── Empty State ───
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

    // ─── Chat View ───
    return (
        <div className="flex-1 flex flex-col relative min-h-0 bg-zinc-950">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                <div className="max-w-3xl mx-auto py-6 pb-4">
                    {displayMessages.map((message, index) => (
                        <MessageBubble
                            key={index}
                            role={message.role}
                            content={message.content}
                            onRetry={message.role === 'assistant' && index === displayMessages.length - 1 ? handleRetry : undefined}
                            isRetrying={isLoading}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {error && <ErrorBanner error={error} />}

            {/* Anchored Input */}
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
