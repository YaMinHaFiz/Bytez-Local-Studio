/**
 * ErrorBoundary Component
 *
 * Catches React errors and displays a fallback UI.
 * Prevents the entire app from crashing on component errors.
 */

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex items-center justify-center bg-zinc-950 min-h-screen">
                    <div className="max-w-md w-full mx-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle size={32} className="text-red-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-zinc-400 mb-6">
                            We encountered an unexpected error. This has been logged to the console.
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                        >
                            <RefreshCw size={18} />
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
