/**
 * EmptyState Component
 *
 * Dashboard-style zero state when no messages exist.
 * Features:
 * - Time-aware greeting
 * - 2x2 Grid of starter prompts
 * - Visual "Sparkles" icon
 */

import { Sparkles, Code, Terminal, Brain, MessageSquare } from 'lucide-react';

export default function EmptyState({ onSuggestionClick }) {
    const hours = new Date().getHours();
    let greeting = 'Good evening';
    if (hours < 12) greeting = 'Good morning';
    else if (hours < 18) greeting = 'Good afternoon';

    const suggestions = [
        {
            icon: Code,
            label: 'Analyze my code',
            prompt: 'Please analyze this code snippet and explain how it works:',
        },
        {
            icon: Terminal,
            label: 'Write a script',
            prompt: 'Write a Python script to automate file backups.',
        },
        {
            icon: Brain,
            label: 'Explain concept',
            prompt: 'Explain Quantum Computing to me like I am 5.',
        },
        {
            icon: MessageSquare,
            label: 'Just chat',
            prompt: 'Hello! Who are you and what can you do?',
        },
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl text-center space-y-8">
                {/* Hero Icon */}
                <div className="mx-auto w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-xl shadow-black/20">
                    <Sparkles size={32} className="text-zinc-100" />
                </div>

                {/* Greeting */}
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                        {greeting}, Ready to build?
                    </h2>
                    <p className="text-zinc-500">
                        Select a suggestion below or type your own request.
                    </p>
                </div>

                {/* Suggestion Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                    {suggestions.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => onSuggestionClick(item.prompt)}
                            className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700
                           p-4 rounded-xl text-left transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <item.icon
                                    size={18}
                                    className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                                />
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100">
                                    {item.label}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                                {item.prompt}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
