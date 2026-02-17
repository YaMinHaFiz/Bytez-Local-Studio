/**
 * ThinkingBlock Component
 *
 * Collapsible "Chain of Thought" / reasoning dropdown.
 * Uses <details>/<summary> for native collapse behavior.
 * Renders reasoning content through MarkdownRenderer.
 */

import { useState } from 'react';
import { Brain, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import MarkdownRenderer from '../MarkdownRenderer';

export default function ThinkingBlock({ thinking, isComplete = true }) {
    const [isOpen, setIsOpen] = useState(false);

    if (!thinking) return null;

    return (
        <div className="mb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full text-left',
                    'transition-all duration-200',
                    isOpen
                        ? 'bg-surface-active text-text-secondary'
                        : 'bg-surface-raised hover:bg-surface-active text-text-muted hover:text-text-secondary'
                )}
            >
                <Brain size={14} className="text-accent-primary flex-shrink-0" />
                <span className="flex-1">
                    {isComplete ? 'Thought process' : 'Thinking…'}
                </span>
                <ChevronRight
                    size={14}
                    className={clsx(
                        'transition-transform duration-200 flex-shrink-0',
                        isOpen && 'rotate-90'
                    )}
                />
            </button>

            {/* Collapsible content */}
            <div
                className={clsx(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isOpen ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                )}
            >
                <div className="pl-4 pr-3 py-3 border-l-2 border-accent-primary/30 ml-2 text-text-secondary">
                    <MarkdownRenderer content={thinking} />
                </div>
            </div>
        </div>
    );
}
