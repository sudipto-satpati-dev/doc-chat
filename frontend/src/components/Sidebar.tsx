import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  currentView: string;
  onNavigate: (view: 'chat-workspace' | 'document-library' | 'analytics') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggleOpen,
  currentView,
  onNavigate
}) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 shadow-sm text-on-surface-variant hover:text-on-surface transition-colors"
        title="Open Sidebar"
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>
    );
  }

  const todaySessions = sessions.slice(0, 3);
  const olderSessions = sessions.slice(3);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant/40 z-40 flex flex-col justify-between select-none">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="h-16 px-space-md flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-space-sm cursor-pointer" onClick={() => onNavigate('chat-workspace')}>
            <img
              src="/corpus_logo.png"
              alt="Corpus Brand Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Corpus
            </span>
          </div>
          <button
            onClick={onToggleOpen}
            className="text-on-surface-variant hover:text-on-surface p-space-xs rounded-lg hover:bg-surface-container transition-colors"
            title="Toggle Sidebar"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">dock_to_left</span>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-space-md">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg py-space-sm px-space-md rounded-lg shadow-[0_1px_2px_rgba(79,70,229,0.2)] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Chat</span>
          </button>
        </div>

        {/* Conversation Navigation */}
        <div className="flex-1 overflow-y-auto px-space-md pb-space-md space-y-space-md">
          {/* Today Group */}
          <div className="space-y-space-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider px-space-xs font-medium">Today</span>
            <nav className="space-y-1">
              {todaySessions.map((session) => {
                const isActive = session.id === activeSessionId && currentView === 'chat-workspace';
                return (
                  <button
                    key={session.id}
                    onClick={() => {
                      onSelectSession(session.id);
                      onNavigate('chat-workspace');
                    }}
                    className={`w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors font-body-sm text-body-sm group text-left ${
                      isActive
                        ? 'bg-surface-container text-primary font-medium'
                        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'}`}>
                      chat_bubble
                    </span>
                    <span className="truncate">{session.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Previous 7 Days Group */}
          {olderSessions.length > 0 && (
            <div className="space-y-space-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider px-space-xs font-medium">Previous 7 Days</span>
              <nav className="space-y-1">
                {olderSessions.map((session) => {
                  const isActive = session.id === activeSessionId && currentView === 'chat-workspace';
                  return (
                    <button
                      key={session.id}
                      onClick={() => {
                        onSelectSession(session.id);
                        onNavigate('chat-workspace');
                      }}
                      className={`w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg transition-colors font-body-sm text-body-sm group text-left ${
                        isActive
                          ? 'bg-surface-container text-primary font-medium'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'}`}>
                        chat_bubble
                      </span>
                      <span className="truncate">{session.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User Footer Profile */}
        <div className="p-space-md border-t border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex items-center justify-between p-space-xs rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary font-semibold flex items-center justify-center text-xs">
                AM
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-medium truncate max-w-[120px]">Alex Morgan</span>
                <span className="font-label-sm text-label-sm text-outline truncate max-w-[120px]">Pro Plan</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[20px] text-outline">settings</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
