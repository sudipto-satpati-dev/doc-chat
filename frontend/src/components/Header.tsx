import React from 'react';

interface HeaderProps {
  currentView: 'chat-workspace' | 'document-library' | 'analytics';
  onNavigate: (view: 'chat-workspace' | 'document-library' | 'analytics') => void;
  sidebarOpen: boolean;
  totalFiles: number;
  onExportSession?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  sidebarOpen,
  totalFiles,
  onExportSession
}) => {
  const headerLeftOffset = sidebarOpen ? 'left-64' : 'left-0';

  return (
    <header className={`fixed top-0 ${headerLeftOffset} right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/30 z-30 transition-all duration-300`}>
      <div className="w-full h-full px-space-lg flex items-center justify-between">
        <div className="flex items-center gap-space-md">
          <span className="font-label-lg text-label-lg text-on-surface font-semibold">Knowledge Session</span>
          <span className="font-label-sm text-label-sm text-outline bg-surface-container px-space-sm py-0.5 rounded-full flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Ready ({totalFiles} files connected)</span>
          </span>
        </div>

        <div className="flex items-center gap-space-sm">
          <nav className="hidden md:flex items-center gap-space-md mr-space-md">
            <button
              onClick={() => onNavigate('chat-workspace')}
              className={`font-label-md text-label-md py-2 transition-colors border-b-2 ${
                currentView === 'chat-workspace'
                  ? 'text-primary font-semibold border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Chat Stream
            </button>
            <button
              onClick={() => onNavigate('document-library')}
              className={`font-label-md text-label-md py-2 transition-colors border-b-2 ${
                currentView === 'document-library'
                  ? 'text-primary font-semibold border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => onNavigate('analytics')}
              className={`font-label-md text-label-md py-2 transition-colors border-b-2 ${
                currentView === 'analytics'
                  ? 'text-primary font-semibold border-primary'
                  : 'text-on-surface-variant hover:text-on-surface border-transparent'
              }`}
            >
              Usage
            </button>
          </nav>

          <div className="flex items-center gap-space-xs border-l border-outline-variant/40 pl-space-md">
            <button
              onClick={() => onNavigate('document-library')}
              className="text-on-surface-variant hover:text-on-surface p-space-xs rounded-lg hover:bg-surface-container transition-colors"
              title="Search documents"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            {onExportSession && (
              <button
                onClick={onExportSession}
                className="text-on-surface-variant hover:text-on-surface p-space-xs rounded-lg hover:bg-surface-container transition-colors"
                title="Export session transcript"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">file_download</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
