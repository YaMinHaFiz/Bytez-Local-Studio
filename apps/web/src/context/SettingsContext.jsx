/**
 * SettingsContext - Global state management for app settings
 * 
 * Provides API key, system prompt, model configuration, and custom models.
 * Replaces prop drilling for settings between App, ChatWindow, and SettingsModal.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAPIKey,
  saveAPIKey,
  getSystemPrompt,
  saveSystemPrompt,
  getCustomModels,
  saveCustomModels
} from '../services/storage';
import { SettingsContext } from './SettingsContextDef.js';

const DEFAULT_MODEL = 'anthropic/claude-opus-4-6';

export const BUILT_IN_MODELS = [
  { id: 'anthropic/claude-opus-4-6', name: 'Claude Opus 4.6' },
  { id: 'anthropic/claude-haiku-4-5', name: 'Claude Haiku 4.5' },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
  { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
  { id: 'openai/gpt-5.2', name: 'GPT 5.2' },
];

export function SettingsProvider({ children }) {
  // API key - loaded from localStorage
  const [apiKey, setApiKey] = useState(() => getAPIKey());

  // System prompt - loaded from localStorage
  const [systemPrompt, setSystemPrompt] = useState(() => getSystemPrompt());

  // Selected model for chat
  const [modelId, setModelId] = useState(DEFAULT_MODEL);

  // Custom user-defined models - loaded from localStorage
  const [customModels, setCustomModels] = useState(() => getCustomModels());

  // Settings modal visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => { saveAPIKey(apiKey); }, [apiKey]);
  useEffect(() => { saveSystemPrompt(systemPrompt); }, [systemPrompt]);
  useEffect(() => { saveCustomModels(customModels); }, [customModels]);

  // Add a custom model
  const addCustomModel = useCallback((id, name) => {
    if (!id?.trim() || !name?.trim()) return;
    setCustomModels(prev => {
      // Prevent duplicates by SDK id
      if (prev.some(m => m.id === id.trim())) return prev;
      return [...prev, { id: id.trim(), name: name.trim() }];
    });
  }, []);

  // Remove a custom model
  const removeCustomModel = useCallback((id) => {
    setCustomModels(prev => prev.filter(m => m.id !== id));
    // If the removed model was selected, reset to default
    setModelId(current => current === id ? DEFAULT_MODEL : current);
  }, []);

  // Combined model list (built-in + custom)
  const allModels = [...BUILT_IN_MODELS, ...customModels];

  const value = {
    apiKey,
    setApiKey,
    systemPrompt,
    setSystemPrompt,
    modelId,
    setModelId,
    customModels,
    addCustomModel,
    removeCustomModel,
    allModels,
    isSettingsOpen,
    openSettings: () => setIsSettingsOpen(true),
    closeSettings: () => setIsSettingsOpen(false)
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}


