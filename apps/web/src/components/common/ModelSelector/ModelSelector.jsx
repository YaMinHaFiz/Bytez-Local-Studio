/**
 * ModelSelector Component
 *
 * Compact dropdown for selecting the AI model.
 * Shows both built-in and user-defined custom models.
 * Fully accessible with proper ARIA attributes.
 */

import { Cpu } from 'lucide-react';

export default function ModelSelector({ value, onChange, models = [] }) {
    return (
        <div className="flex items-center gap-2">
            <Cpu size={14} className="text-zinc-500" aria-hidden="true" />
            <div className="relative">
                <span className="sr-only">AI Model:</span>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label="Select AI model"
                    className="w-56 px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800
                       text-zinc-300 rounded-md appearance-none cursor-pointer
                       focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                       transition-colors font-mono pr-7"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em'
                    }}
                >
                    {models.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
