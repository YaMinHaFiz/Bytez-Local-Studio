/**
 * Bytez Local Studio — Main App Component
 *
 * Professional IDE-class layout with:
 * - Collapsed sidebar rail
 * - Dark bg-bg-primary background
 * - Slim header with model selector
 * - Relative main area for floating input
 */

import { ChatWindow } from './components/chat';
import { Sidebar } from './components/layout';
import { SettingsModal } from './components/settings';
import { ModelSelector } from './components/common';
import { useChat, useSettings } from './context';

function App() {
  const {
    conversations,
    currentConversationId,
    selectConversation,
    clearCurrentConversation,
    createConversation,
    appendMessage,
    updateLastMessage,
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
      <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
        {/* Sidebar Rail */}
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={selectConversation}
          onNewChat={clearCurrentConversation}
          onSettingsClick={openSettings}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Header */}
          <header className="h-12 border-b border-border-subtle flex items-center justify-between px-5 flex-shrink-0">
            <h1 className="text-sm font-semibold text-text-secondary tracking-tight">
              Bytez Local Studio
            </h1>
            <ModelSelector value={modelId} onChange={setModelId} models={allModels} />
          </header>

          {/* Chat Area */}
          <ChatWindow
            conversationId={currentConversationId}
            modelId={modelId}
            systemPrompt={systemPrompt}
            apiKey={apiKey}
            onConversationCreated={(conv) => selectConversation(conv.id)}
            createConversation={createConversation}
            appendMessage={appendMessage}
            updateLastMessage={updateLastMessage}
            getCurrentConversation={getCurrentConversation}
          />
        </main>

        {/* Settings Panel */}
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
      </div>
    </div>
  );
}

export default App;

