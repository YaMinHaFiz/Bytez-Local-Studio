/**
 * MessageBubble Component
 *
 * Visual representation of chat messages.
 * Features:
 * - Distinct styles for User (Bubble) vs AI (Full width transparent)
 * - Markdown rendering via react-markdown
 * - Code syntax highlighting with copy functionality
 * - Collapsible <thinking> blocks for CoT
 * - Action toolbar (Copy, Regenerate, ThumbsUp)
 * - Entrance animations
 */

import React, { useState } from 'react';
import {
    Copy,
    Check,
    RotateCcw,
    ThumbsUp,
    ChevronDown,
    ChevronRight,
    User,
    Bot,
} from 'lucide-react';
import clsx from 'clsx';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';

export default function MessageBubble({ role, content, onRetry, isRetrying }) {
    const isUser = role === 'user';
    const [copied, setCopied] = useState(false);
    const [thinkingExpanded, setThinkingExpanded] = useState(false);

    // Extract <thinking> content
    const thinkingMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
    const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : null;
    const cleanContent = content.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRetry = () => {
        if (onRetry && !isRetrying) {
            onRetry();
        }
    };

    return (
        <div
            className={clsx(
                'group w-full flex gap-4 p-4 md:px-8 transition-colors duration-200 animate-fade-in',
                isUser ? 'flex-row-reverse' : 'flex-row hover:bg-zinc-900/30'
            )}
        >
            {/* Avatar / Icon */}
            <div
                className={clsx(
                    'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-transform duration-200',
                    isUser
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                )}
            >
                {isUser ? <User size={16} /> : <Bot size={18} />}
            </div>

            {/* Content Container */}
            <div className={clsx('flex-1 min-w-0 max-w-4xl', isUser && 'text-right')}>
                
                {/* User Name / Time (Optional, skipped for cleaner look) */}
                <div className={clsx("mb-1 text-xs font-medium text-zinc-500", isUser && "hidden")}>
                    Bytez AI
                </div>

                <div
                    className={clsx(
                        'text-base leading-relaxed',
                        isUser
                            ? 'inline-block bg-zinc-800 text-zinc-100 px-5 py-2.5 rounded-2xl rounded-tr-sm text-left'
                            : 'text-zinc-300'
                    )}
                >
                    {!isUser && thinkingContent && (
                        <div className="mb-4">
                            <button
                                onClick={() => setThinkingExpanded(!thinkingExpanded)}
                                className="flex items-center gap-2 text-xs font-mono text-amber-500/80 hover:text-amber-400 transition-all duration-200"
                            >
                                <span className={clsx(
                                    'transition-transform duration-200',
                                    thinkingExpanded && 'rotate-90'
                                )}>
                                    <ChevronRight size={14} />
                                </span>
                                <span>Thinking Process</span>
                            </button>
                            <div className={clsx(
                                'collapse-transition',
                                thinkingExpanded && 'expanded'
                            )}>
                                <div>
                                    <div className="mt-2 pl-3 border-l-2 border-amber-500/20 text-sm text-amber-200/60 italic">
                                        {thinkingContent}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isUser ? (
                        cleanContent || content
                    ) : (
                        <MarkdownRenderer content={cleanContent || content} />
                    )}
                </div>

                {/* AI-Only Action Toolbar */}
                {!isUser && (
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button
                            onClick={handleCopy}
                            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all duration-150 active:scale-90"
                            title="Copy"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        {onRetry && (
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                className={clsx(
                                    "p-1.5 rounded-md transition-all duration-150",
                                    isRetrying 
                                        ? "text-zinc-600 cursor-not-allowed" 
                                        : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 active:scale-90"
                                )}
                                title="Regenerate"
                            >
                                <RotateCcw size={14} className={isRetrying ? "animate-spin" : ""} />
                            </button>
                        )}
                        <button
                            className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-all duration-150 active:scale-90"
                            title="Good response"
                        >
                            <ThumbsUp size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

