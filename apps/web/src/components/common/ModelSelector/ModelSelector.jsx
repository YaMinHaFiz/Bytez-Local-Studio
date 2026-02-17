/**
 * ModelSelector Component
 *
 * Compact dropdown for selecting the AI model.
 * Shows both built-in and user-defined custom models.
 */

import { Cpu } from 'lucide-react';

export default function ModelSelector({ value, onChange, models = [] }) {
    return (
        <div className="flex items-center gap-2">
            <Cpu size={14} className="text-text-faint" />
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-56 px-2.5 py-1 text-xs bg-surface border border-border-default
                   text-text-secondary rounded-md appearance-none cursor-pointer
                   focus:outline-none focus:border-accent-primary/50
                   transition-colors font-mono"
            >
                {models.map((model) => (
                    <option key={model.id} value={model.id}>
                        {model.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

