/**
 * Bytez Local Studio — Main App Component
 *
 * Professional IDE-class layout with:
 * - Collapsed sidebar rail
 * - Dark bg-bg-primary background
 * - Slim header with model selector
 * - Relative main area for floating input
 * - Error boundaries for graceful error handling
 */

import { ChatWindow } from './components/chat';
import { Sidebar } from './components/layout';
import { SettingsModal } from './components/settings';
import { ModelSelector } from './components/common';
import { useChat, useSettings } from './context';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function App() {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    clearCurrentConversation,
    createConversation,
    appendMessage,
    getCurrentConversation,
    deleteConversation,
    renameConversation,
  } = useChat();

  const {
    apiKey,
    systemPrompt,
    modelId,
    setModelId,
    isSettingsOpen,
    openSettings,
    closeSettings,
    setApiKey,
    setSystemPrompt,
    customModels,
    addCustomModel,
    removeCustomModel,
    allModels,
  } = useSettings();

  return (
    <div className="dark">
      <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
        <ErrorBoundary>
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={selectConversation}
            onNewChat={clearCurrentConversation}
            onSettingsClick={openSettings}
            onDeleteConversation={deleteConversation}
            onRenameConversation={renameConversation}
          />
        </ErrorBoundary>

        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <ErrorBoundary>
            <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-5 flex-shrink-0">
              <h1 className="text-sm font-semibold text-zinc-400 tracking-tight">
                Bytez Local Studio
              </h1>
              <ModelSelector value={modelId} onChange={setModelId} models={allModels} />
            </header>
          </ErrorBoundary>

          <ErrorBoundary>
            <ChatWindow
              conversationId={currentConversationId}
              modelId={modelId}
              systemPrompt={systemPrompt}
              apiKey={apiKey}
              onConversationCreated={(conv) => selectConversation(conv.id)}
              createConversation={createConversation}
              appendMessage={appendMessage}
              getCurrentConversation={getCurrentConversation}
            />
          </ErrorBoundary>
        </main>

        <ErrorBoundary>
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={closeSettings}
            apiKey={apiKey}
            onApiKeyChange={setApiKey}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            modelId={modelId}
            onModelIdChange={setModelId}
            customModels={customModels}
            allModels={allModels}
            onAddCustomModel={addCustomModel}
            onRemoveCustomModel={removeCustomModel}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
