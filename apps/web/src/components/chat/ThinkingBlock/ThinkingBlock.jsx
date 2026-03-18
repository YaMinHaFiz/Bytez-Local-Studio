/**
 * ThinkingBlock Component
 *
 * Collapsible "Chain of Thought" / reasoning dropdown.
 * Features proper accessibility with ARIA attributes.
 */

import { useState } from 'react';
import { Brain, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import MarkdownRenderer from '../MarkdownRenderer';

export default function ThinkingBlock({ thinking, isComplete = true }) {
    const [isOpen, setIsOpen] = useState(false);
    const contentId = `thinking-content-${thinking?.substring(0, 20) || 'default'}`;

    if (!thinking) return null;

    return (
        <div className="mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={contentId}
                className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full text-left transition-all duration-200',
                    isOpen
                        ? 'bg-zinc-800 text-zinc-300'
                        : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'
                )}
            >
                <Brain size={14} className="text-blue-400 flex-shrink-0" />
                <span className="flex-1">
                    {isComplete ? 'Thought process' : 'Thinking…'}
                </span>
                <ChevronRight
                    size={14}
                    className={clsx(
                        'transition-transform duration-200 flex-shrink-0',
                        isOpen && 'rotate-90'
                    )}
                    aria-hidden="true"
                />
            </button>

            <div
                id={contentId}
                role="region"
                aria-label="AI thinking content"
                className={clsx(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                )}
            >
                <div className="pl-4 pr-3 py-3 border-l-2 border-blue-500/30 ml-2 text-zinc-400 text-sm">
                    <MarkdownRenderer content={thinking} />
                </div>
            </div>
        </div>
    );
}
