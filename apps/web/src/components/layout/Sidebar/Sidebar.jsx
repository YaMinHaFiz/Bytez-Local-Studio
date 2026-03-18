/**
 * Sidebar Component — Navigation Rail
 *
 * Foldable sidebar with time-based conversation grouping.
 * Features:
 * - "New Chat" primary action
 * - Today / Yesterday / Previous 7 Days grouping
 * - Hover actions for Edit/Delete (functional)
 * - Inline rename with keyboard support
 * - Delete confirmation
 * - Smooth expansion/collapse
 * - Memoized conversation grouping for performance
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Plus,
    Settings,
    MessageSquare,
    PanelLeftClose,
    PanelLeft,
    Monitor,
    Edit3,
    Trash2,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar({
    conversations = [],
    currentConversationId,
    onSelectConversation,
    onNewChat,
    onSettingsClick,
    onDeleteConversation,
    onRenameConversation,
}) {
    const [expanded, setExpanded] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const editInputRef = useRef(null);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const groupedConversations = useMemo(() => {
        const groups = {
            Today: [],
            Yesterday: [],
            'Previous 7 Days': [],
            Older: [],
        };

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        conversations.forEach((conv) => {
            const convDate = new Date(conv.createdAt || conv.id);
            const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

            if (convDay.getTime() === today.getTime()) {
                groups.Today.push(conv);
            } else if (convDay.getTime() === yesterday.getTime()) {
                groups.Yesterday.push(conv);
            } else if (convDay > sevenDaysAgo) {
                groups['Previous 7 Days'].push(conv);
            } else {
                groups.Older.push(conv);
            }
        });

        return groups;
    }, [conversations]);

    const handleStartEdit = (e, conv) => {
        e.stopPropagation();
        setEditingId(conv.id);
        setEditValue(conv.title);
    };

    const handleSaveRename = (e) => {
        e?.stopPropagation();
        if (editingId && editValue.trim()) {
            onRenameConversation?.(editingId, editValue.trim());
        }
        setEditingId(null);
        setEditValue('');
    };

    const handleCancelRename = (e) => {
        e?.stopPropagation();
        setEditingId(null);
        setEditValue('');
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveRename();
        } else if (e.key === 'Escape') {
            handleCancelRename();
        }
    };

    const handleStartDelete = (e, conv) => {
        e.stopPropagation();
        setDeletingId(conv.id);
    };

    const handleConfirmDelete = (e) => {
        e?.stopPropagation();
        if (deletingId) {
            onDeleteConversation?.(deletingId);
        }
        setDeletingId(null);
    };

    const handleCancelDelete = (e) => {
        e?.stopPropagation();
        setDeletingId(null);
    };

    const renderGroup = (label, list) => {
        if (!list || list.length === 0) return null;
        return (
            <div className="mb-6 animate-in slide-in-from-left-2 duration-300">
                <h3 className="px-3 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {label}
                </h3>
                <div className="space-y-0.5" role="listbox" aria-label={label}>
                    {list.map((conv) => {
                        const isActive = conv.id === currentConversationId;
                        const isEditing = editingId === conv.id;
                        const isDeleting = deletingId === conv.id;

                        return (
                            <div
                                key={conv.id}
                                role="option"
                                aria-selected={isActive}
                                className={clsx(
                                    'group relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200',
                                    isActive
                                        ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                )}
                            >
                                <span 
                                    className={clsx(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 rounded-r-full bg-blue-500 transition-opacity",
                                        isActive ? "opacity-100" : "opacity-0"
                                    )}
                                    aria-hidden="true"
                                />

                                {isDeleting ? (
                                    <div className="flex items-center gap-2 w-full pl-1" role="alert">
                                        <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                                        <span className="text-xs text-zinc-300 flex-1">Delete?</span>
                                        <button
                                            onClick={handleConfirmDelete}
                                            className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-red-500"
                                            title="Confirm delete"
                                        >
                                            <Check size={12} />
                                        </button>
                                        <button
                                            onClick={handleCancelDelete}
                                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500"
                                            title="Cancel"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : isEditing ? (
                                    <div className="flex items-center gap-2 w-full">
                                        <MessageSquare size={16} className="flex-shrink-0 text-zinc-500" />
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={handleEditKeyDown}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-w-0"
                                        />
                                        <button
                                            onClick={handleSaveRename}
                                            className="p-1 hover:bg-green-500/20 rounded text-green-400 transition-colors focus-visible:ring-2 focus-visible:ring-green-500"
                                            title="Save"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <button
                                            onClick={handleCancelRename}
                                            className="p-1 hover:bg-zinc-700 rounded text-zinc-400 transition-colors focus-visible:ring-2 focus-visible:ring-zinc-500"
                                            title="Cancel"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => onSelectConversation(conv.id)}
                                            className="flex items-center gap-3 flex-1 min-w-0 text-left"
                                        >
                                            <MessageSquare
                                                size={16}
                                                className={clsx(
                                                    'flex-shrink-0 transition-colors',
                                                    isActive ? 'text-zinc-100' : 'text-zinc-600 group-hover:text-zinc-400'
                                                )}
                                            />
                                            <span className="truncate pr-8">{conv.title}</span>
                                        </button>

                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleStartEdit(e, conv)}
                                                className="p-1 hover:bg-zinc-700/50 rounded transition-colors focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                                                title="Rename"
                                            >
                                                <Edit3 size={12} className="text-zinc-500 hover:text-zinc-300" />
                                            </button>
                                            <button
                                                onClick={(e) => handleStartDelete(e, conv)}
                                                className="p-1 hover:bg-zinc-700/50 rounded transition-colors focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-500"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} className="text-zinc-500 hover:text-red-400" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <aside
            className={clsx(
                'flex flex-col bg-zinc-950 border-r border-zinc-800 h-screen overflow-hidden transition-all duration-300 ease-in-out',
                expanded ? 'w-64' : 'w-[68px]'
            )}
            aria-label="Chat sidebar"
        >
            <div className="p-3 pb-2 flex items-center justify-between">
                {expanded ? (
                    <div className="flex items-center gap-2 pl-1 select-none">
                        <div className="w-5 h-5 bg-gradient-to-br from-zinc-100 to-zinc-400 rounded-md flex items-center justify-center">
                           <Monitor size={12} className="text-zinc-900" />
                        </div>
                        <span className="font-semibold tracking-tight text-zinc-100">Bytez</span>
                    </div>
                ) : (
                   <div className="w-10 h-10 flex items-center justify-center">
                       <Monitor size={20} className="text-zinc-400" />
                   </div>
                )}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {expanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                </button>
            </div>

            <div className="px-3 py-2">
                <button
                    onClick={onNewChat}
                    className={clsx(
                        'flex items-center justify-center gap-2 w-full bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg transition-all duration-200 shadow-sm shadow-zinc-900/10 font-medium text-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
                        expanded ? 'px-4 py-2.5' : 'w-10 h-10 p-0'
                    )}
                    title="New Chat"
                >
                    <Plus size={18} />
                    {expanded && <span>New Chat</span>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-zinc-800 px-3 py-2">
                {expanded ? (
                    <>
                        {conversations.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-xs text-zinc-600">No chats yet</p>
                            </div>
                        ) : (
                            <>
                                {renderGroup('Today', groupedConversations.Today)}
                                {renderGroup('Yesterday', groupedConversations.Yesterday)}
                                {renderGroup('Previous 7 Days', groupedConversations['Previous 7 Days'])}
                                {renderGroup('Older', groupedConversations.Older)}
                            </>
                        )}
                    </>
                ) : (
                    <div className="space-y-2 flex flex-col items-center">
                        {conversations.slice(0, 8).map((conv) => {
                             const isActive = conv.id === currentConversationId;
                             return (
                                <button
                                    key={conv.id}
                                    onClick={() => onSelectConversation(conv.id)}
                                    className={clsx(
                                        'w-10 h-10 flex items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-blue-500',
                                        isActive
                                            ? 'bg-zinc-800 text-zinc-100'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                    )}
                                    title={conv.title}
                                >
                                    <MessageSquare size={18} />
                                </button>
                             );
                        })}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-zinc-800">
                <button
                    onClick={onSettingsClick}
                    className={clsx(
                        'flex items-center gap-3 w-full rounded-lg transition-colors text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 focus-visible:ring-2 focus-visible:ring-blue-500',
                        expanded ? 'px-3 py-2.5' : 'w-10 h-10 justify-center'
                    )}
                >
                    <Settings size={18} />
                    {expanded && <span className="text-sm font-medium">Settings</span>}
                </button>
            </div>
        </aside>
    );
}
