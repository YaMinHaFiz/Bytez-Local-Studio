/**
 * SettingsContext - Global state management for app settings
 * 
 * Provides API key, system prompt, model configuration, and custom models.
 * Uses useMemo for optimized model list computation.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAPIKey,
  saveAPIKey,
  getSystemPrompt,
  saveSystemPrompt,
  getCustomModels,
  saveCustomModels
} from '../services/storage';
import { SettingsContext } from './SettingsContextDef.js';
import { BUILT_IN_MODELS } from '../constants/models.js';

const DEFAULT_MODEL = 'anthropic/claude-opus-4-6';

export function SettingsProvider({ children }) {
  const [apiKey, setApiKey] = useState(() => getAPIKey());
  const [systemPrompt, setSystemPrompt] = useState(() => getSystemPrompt());
  const [modelId, setModelId] = useState(DEFAULT_MODEL);
  const [customModels, setCustomModels] = useState(() => getCustomModels());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => { saveAPIKey(apiKey); }, [apiKey]);
  useEffect(() => { saveSystemPrompt(systemPrompt); }, [systemPrompt]);
  useEffect(() => { saveCustomModels(customModels); }, [customModels]);

  const addCustomModel = useCallback((id, name) => {
    if (!id?.trim() || !name?.trim()) return;
    setCustomModels(prev => {
      if (prev.some(m => m.id === id.trim())) return prev;
      return [...prev, { id: id.trim(), name: name.trim() }];
    });
  }, []);

  const removeCustomModel = useCallback((id) => {
    setCustomModels(prev => prev.filter(m => m.id !== id));
    setModelId(current => current === id ? DEFAULT_MODEL : current);
  }, []);

  const allModels = useMemo(
    () => [...BUILT_IN_MODELS, ...customModels],
    [customModels]
  );

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
