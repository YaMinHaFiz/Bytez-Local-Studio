# Bytez Local Studio

A modern, privacy-focused chat interface for the Bytez AI API. Built with React and Tailwind CSS, this application provides a seamless conversational experience with AI models while keeping all your data stored locally in your browser.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Features

- **🔒 Privacy-First** - All data stored locally in your browser via localStorage
- **⚡ Real-time Streaming** - Token-by-token response display for smooth conversation flow
- **🌙 Dark Mode UI** - Clean, modern interface optimized for low-light environments
- **💬 Multiple Conversations** - Organized chat history with easy conversation management
- **🤖 Custom System Prompts** - Configure AI behavior to suit your needs
- **🎯 Model Selection** - Choose from various AI models or add custom ones
- **📝 Markdown Support** - Rich text formatting with syntax highlighting for code blocks
- **🧠 Thinking Block Display** - Visualize AI reasoning process when available
- **🔧 No Backend Required** - Frontend-only application, just add your API key and start chatting

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or higher
- A Bytez API key from [bytez.com](https://bytez.com)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bytez-local-studio

# Install dependencies
npm install

# Navigate to the web app
cd apps/web

# Install app dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
cd apps/web
npm run build
```

The built files will be in the `dist` directory.

## 📖 Usage

1. **Get Your API Key**: Sign up at [bytez.com](https://bytez.com) and obtain your API key
2. **Open Settings**: Click the gear icon (⚙️) in the sidebar
3. **Enter API Key**: Paste your Bytez API key in the settings panel
4. **Select a Model**: Choose from the available models or add a custom one
5. **Start Chatting**: Click "New Chat" and begin your conversation!

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) - Modern UI library with hooks and context
- **Build Tool**: [Vite 7](https://vitejs.dev/) - Fast development and optimized builds
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **State Management**: React Context API for global state
- **Markdown Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown) with plugins
- **Code Highlighting**: [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: ESLint with React-specific rules

## 📁 Project Structure

```
bytez-local-studio/
├── apps/
│   └── web/                    # Main web application
│       ├── src/
│       │   ├── components/     # React components
│       │   │   ├── chat/       # Chat-related components
│       │   │   │   ├── ChatWindow/      # Main chat display
│       │   │   │   ├── ChatInput/       # Message input
│       │   │   │   ├── MessageBubble/   # Individual messages
│       │   │   │   ├── MarkdownRenderer/# Markdown display
│       │   │   │   ├── ThinkingBlock/   # AI reasoning display
│       │   │   │   └── EmptyState/      # Initial state
│       │   │   ├── layout/     # Layout components
│       │   │   │   └── Sidebar/         # Navigation sidebar
│       │   │   ├── settings/   # Settings components
│       │   │   │   └── SettingsModal/   # Settings panel
│       │   │   └── common/     # Shared components
│       │   │       └── ModelSelector/   # Model dropdown
│       │   ├── context/        # React Context providers
│       │   │   ├── ChatContext.jsx      # Chat state management
│       │   │   └── SettingsContext.jsx  # Settings state
│       │   ├── hooks/          # Custom React hooks
│       │   │   └── useLocalStorage.js   # localStorage hook
│       │   ├── services/       # API & storage services
│       │   │   ├── bytez/      # Bytez API client
│       │   │   └── storage/    # localStorage utilities
│       │   ├── constants/      # App configuration
│       │   │   └── config.js            # Default settings
│       │   ├── utils/          # Helper functions
│       │   │   ├── formatters.js        # Text formatting
│       │   │   ├── parseThinking.js     # Parse thinking blocks
│       │   │   └── validators.js        # Input validation
│       │   ├── styles/         # Global styles
│       │   ├── App.jsx         # Main application component
│       │   └── main.jsx        # Application entry point
│       ├── public/             # Static assets
│       ├── index.html          # HTML entry point
│       ├── package.json        # Dependencies
│       ├── vite.config.js      # Vite configuration
│       ├── tailwind.config.js  # Tailwind CSS configuration
│       └── eslint.config.js    # ESLint configuration
├── .github/                    # GitHub templates and workflows
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   ├── workflows/              # CI/CD workflows
│   └── PULL_REQUEST_TEMPLATE.md
├── package.json                # Root package configuration
└── README.md                   # This file
```

## 🎨 Customization

### Adding Custom Models

You can add custom models through the Settings panel. The app supports any model available through the Bytez API.

### Modifying the System Prompt

Change the system prompt in Settings to customize the AI's behavior and personality.

### Theming

The app uses Tailwind CSS with a custom color scheme. You can modify colors in the Tailwind configuration file.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
