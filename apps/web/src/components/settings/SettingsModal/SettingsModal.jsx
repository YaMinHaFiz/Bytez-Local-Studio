/**
 * SettingsPanel Component
 *
 * Modern slide-over panel with futuristic design.
 * Features:
 * - Slides in from the right side
 * - Integrated feel with chat interface
 * - Tabbed sections for organization
 * - Gradient accents and glassmorphism effects
 * - Smooth animations and transitions
 * - Custom model management
 */

import { useState, useCallback } from 'react';
import {
    X,
    Key,
    MessageSquareText,
    Save,
    CheckCircle,
    Sparkles,
    Cpu,
    Shield,
    Plus,
    Trash2,
} from 'lucide-react';
import clsx from 'clsx';
import { BUILT_IN_MODELS } from '../../../constants/models';

const TABS = [
    { id: 'api', label: 'API', icon: Key },
    { id: 'model', label: 'Model', icon: Cpu },
    { id: 'prompt', label: 'System Prompt', icon: MessageSquareText },
];

export default function SettingsPanel({
    isOpen,
    onClose,
    apiKey,
    onApiKeyChange,
    systemPrompt,
    onSystemPromptChange,
    modelId,
    onModelIdChange,
    allModels = [],
    onAddCustomModel,
    onRemoveCustomModel,
}) {
    const [activeTab, setActiveTab] = useState('api');
    const [success, setSuccess] = useState(false);
    const [newModelId, setNewModelId] = useState('');
    const [newModelName, setNewModelName] = useState('');
    const [addError, setAddError] = useState('');

    // Use refs to track if we need to sync with props
    const [syncKey, setSyncKey] = useState(0);

    // Sync state with props when panel opens
    const syncWithProps = useCallback(() => {
        setSyncKey(prev => prev + 1);
    }, []);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleSave = () => {
        // Get values from DOM refs or controlled state
        const apiKeyInput = document.getElementById('settings-api-key');
        const promptInput = document.getElementById('settings-system-prompt');
        const selectedModel = document.querySelector('input[name="model-selection"]:checked');

        if (onApiKeyChange && apiKeyInput) onApiKeyChange(apiKeyInput.value.trim());
        if (onSystemPromptChange && promptInput) onSystemPromptChange(promptInput.value);
        if (onModelIdChange && selectedModel) onModelIdChange(selectedModel.value);

        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
            onClose();
        }, 1200);
    };

    const handleAddModel = () => {
        setAddError('');
        if (!newModelId.trim() || !newModelName.trim()) {
            setAddError('Both fields are required.');
            return;
        }
        // Check for duplicate across all models
        if (allModels.some(m => m.id === newModelId.trim())) {
            setAddError('A model with this SDK name already exists.');
            return;
        }
        onAddCustomModel(newModelId.trim(), newModelName.trim());
        setNewModelId('');
        setNewModelName('');
    };

    // Sync when panel opens
    if (isOpen && syncKey === 0) {
        syncWithProps();
    }

    // Don't render anything if modal is closed
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            onClick={handleBackdropClick}
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Panel */}
            <div
                className="relative w-full max-w-md h-full bg-zinc-950/95 border-l border-zinc-800/50 shadow-2xl shadow-black/50
                    flex flex-col overflow-hidden"
            >
                {/* Header with gradient accent */}
                <div className="relative">
                    {/* Top gradient line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    
                    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                                <Sparkles size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
                                <p className="text-xs text-zinc-500">Configure your workspace</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4">
                    <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={clsx(
                                        'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                        activeTab === tab.id
                                            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                    )}
                                >
                                    <Icon size={16} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 animate-fade-in">
                            <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                <CheckCircle size={20} className="text-green-400" />
                                <span className="text-sm font-medium text-green-400">Settings saved successfully!</span>
                            </div>
                        </div>
                    )}

                    {/* API Tab */}
                    {activeTab === 'api' && (
                        <div key={syncKey} className="space-y-6 animate-fade-in">
                            {/* Info Card */}
                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                <div className="flex items-start gap-3">
                                    <Shield size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-400">Local Storage</p>
                                        <p className="text-xs text-blue-400/70 mt-1">
                                            Your API key is stored securely in your browser's localStorage and never leaves your device.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* API Key Input */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Key size={16} className="text-zinc-500" />
                                    Bytez API Key
                                </label>
                                <div className="relative">
                                    <input
                                        id="settings-api-key"
                                        type="password"
                                        defaultValue={apiKey || ''}
                                        placeholder="Enter your API key"
                                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl
                                         text-zinc-100 placeholder-zinc-600 text-sm
                                         focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10
                                         transition-all"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-600">
                                    Get your API key from{' '}
                                    <a
                                        href="https://bytez.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                                    >
                                        bytez.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Model Tab */}
                    {activeTab === 'model' && (
                        <div key={syncKey} className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                <div className="flex items-start gap-3">
                                    <Cpu size={18} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-400">Model Selection</p>
                                        <p className="text-xs text-purple-400/70 mt-1">
                                            Choose from built-in models or add your own custom models with their SDK identifiers.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Model list — built-in + custom */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-300">Active Model</label>
                                <div className="space-y-2">
                                    {allModels.map((model) => {
                                        const isCustom = !BUILT_IN_MODELS.some(b => b.id === model.id);
                                        return (
                                            <label
                                                key={model.id}
                                                className={clsx(
                                                    'w-full p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer block',
                                                    modelId === model.id
                                                        ? 'bg-blue-500/10 border-blue-500/30'
                                                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
                                                )}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <input
                                                            type="radio"
                                                            name="model-selection"
                                                            value={model.id}
                                                            defaultChecked={modelId === model.id}
                                                            className="w-4 h-4 text-blue-500 bg-zinc-800 border-zinc-600 focus:ring-blue-500/20 flex-shrink-0"
                                                        />
                                                        <div className="ml-2 min-w-0">
                                                            <span className="font-medium text-zinc-200 block truncate">{model.name}</span>
                                                            <span className="text-xs text-zinc-500 font-mono block truncate">{model.id}</span>
                                                        </div>
                                                    </div>
                                                    {isCustom && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                onRemoveCustomModel(model.id);
                                                            }}
                                                            className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 ml-2"
                                                            title="Remove custom model"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Add Custom Model Form */}
                            <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <Plus size={16} className="text-zinc-500" />
                                    Add Custom Model
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={newModelId}
                                        onChange={(e) => { setNewModelId(e.target.value); setAddError(''); }}
                                        placeholder="SDK Model Name (e.g. meta/llama-3)"
                                        className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl
                                         text-zinc-100 placeholder-zinc-600 text-sm font-mono
                                         focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10
                                         transition-all"
                                    />
                                    <input
                                        type="text"
                                        value={newModelName}
                                        onChange={(e) => { setNewModelName(e.target.value); setAddError(''); }}
                                        placeholder="Display Title (e.g. Llama 3)"
                                        className="w-full px-4 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl
                                         text-zinc-100 placeholder-zinc-600 text-sm
                                         focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10
                                         transition-all"
                                    />
                                </div>
                                {addError && (
                                    <p className="text-xs text-red-400">{addError}</p>
                                )}
                                <button
                                    type="button"
                                    onClick={handleAddModel}
                                    disabled={!newModelId.trim() || !newModelName.trim()}
                                    className={clsx(
                                        'w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                                        newModelId.trim() && newModelName.trim()
                                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-200'
                                            : 'bg-zinc-900/30 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                    )}
                                >
                                    <Plus size={16} />
                                    Add Model
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Prompt Tab */}
                    {activeTab === 'prompt' && (
                        <div key={syncKey} className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-start gap-3">
                                    <MessageSquareText size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-400">System Prompt</p>
                                        <p className="text-xs text-amber-400/70 mt-1">
                                            Define the AI's behavior and personality. This prompt is sent with every message to guide the AI's responses.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-zinc-300">Custom Instructions</label>
                                <textarea
                                    id="settings-system-prompt"
                                    defaultValue={systemPrompt || ''}
                                    placeholder="You are a helpful coding assistant..."
                                    rows={8}
                                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl
                                     text-zinc-100 placeholder-zinc-600 text-sm resize-none
                                     focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10
                                     transition-all font-mono leading-relaxed"
                                />
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-zinc-600">
                                        Custom behavior configuration
                                    </span>
                                    <button
                                        onClick={() => {
                                            const textarea = document.getElementById('settings-system-prompt');
                                            if (textarea) textarea.value = '';
                                        }}
                                        className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-zinc-800/50 bg-zinc-950/50">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-400
                             hover:text-zinc-200 hover:bg-zinc-800/50
                             rounded-xl transition-all border border-transparent hover:border-zinc-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={success}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white
                             bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500
                             rounded-xl transition-all shadow-lg shadow-blue-500/20
                             disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

