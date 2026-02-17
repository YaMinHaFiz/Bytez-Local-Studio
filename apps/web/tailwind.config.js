/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // VS Code / LM Studio inspired dark palette
                'chat-gray': {
                    900: '#1e1e1e',  // Main background (darkest)
                    850: '#222222',  // Slightly lighter
                    800: '#2d2d2d',  // Sidebar background
                    700: '#3c3c3c',  // Hover states
                    600: '#4a4a4a',  // Borders
                    500: '#6e6e6e',  // Muted text
                    400: '#858585',  // Secondary text
                    300: '#a0a0a0',  // Placeholder text
                    200: '#cccccc',  // Primary text
                    100: '#e5e5e5',  // Bright text
                },
                'accent': {
                    primary: '#0078d4',   // Blue accent
                    hover: '#1a8cdc',     // Blue hover
                    success: '#4ec9b0',   // Teal success
                    warning: '#dcdcaa',   // Yellow warning
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
            },
        },
    },
    plugins: [],
}
