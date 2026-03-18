/**
 * useKeyboardShortcuts Hook
 *
 * Provides keyboard shortcuts for common actions:
 * - Ctrl/Cmd + N: New chat
 * - Ctrl/Cmd + ,: Open settings
 * - Escape: Close modals
 */

import { useEffect } from 'react';

export function useKeyboardShortcuts({ onNewChat, onOpenSettings, onCloseModal }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && e.key === 'n') {
                e.preventDefault();
                onNewChat?.();
            }

            if (modifier && e.key === ',') {
                e.preventDefault();
                onOpenSettings?.();
            }

            if (e.key === 'Escape') {
                onCloseModal?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNewChat, onOpenSettings, onCloseModal]);
}

export default useKeyboardShortcuts;
