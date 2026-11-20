import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatWorkspace } from './components/ChatWorkspace';
import { CitationInspector } from './components/CitationInspector';
import { DocumentLibrary } from './components/DocumentLibrary';
import { UsageAnalytics } from './components/UsageAnalytics';
import { ChatSession, ChatMessage, Citation, DocumentInfo } from './types';
import { sendChatMessage, fetchDocuments, triggerReIngest, uploadPdfFile, deleteDocumentFile } from './api/client';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'chat-workspace' | 'document-library' | 'analytics'>('chat-workspace');
  
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'session-default',
      title: 'New Knowledge Session',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-default');
  
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [totalChunks, setTotalChunks] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Fetch document library metrics on load
  const loadDocuments = async () => {
    try {
      const res = await fetchDocuments();
      setDocuments(res.documents);
      setTotalChunks(res.total_chunks);
    } catch (err) {
      console.warn('Could not connect to FastAPI backend:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: 'New Knowledge Session',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setCurrentView('chat-workspace');
  };

  const handleSendMessage = async (messageText: string, topK: number = 5) => {
    if (!messageText.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update active session immediately with user message
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id === activeSessionId) {
          const isFirstMessage = sess.messages.length === 0;
          return {
            ...sess,
            title: isFirstMessage ? messageText.slice(0, 30) + '...' : sess.title,
            messages: [...sess.messages, userMessage],
          };
        }
        return sess;
      })
    );

    setIsLoading(true);

    try {
      const apiRes = await sendChatMessage(messageText, activeSessionId, topK);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: apiRes.answer,
        citations: apiRes.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, assistantMessage],
            };
          }
          return sess;
        })
      );
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Error: Unable to fetch answer from backend. (${error.message || 'Make sure FastAPI backend is running on port 8000'})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setSessions((prev) =>
        prev.map((sess) => (sess.id === activeSessionId ? { ...sess, messages: [...sess.messages, errorMessage] } : sess))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    await uploadPdfFile(file);
    await loadDocuments();
  };

  const handleTriggerReIngest = async () => {
    await triggerReIngest();
    await loadDocuments();
  };

  const handleDeleteDocument = async (filename: string) => {
    await deleteDocumentFile(filename);
    await loadDocuments();
  };

  const handleExportSession = () => {
    if (!activeSession || activeSession.messages.length === 0) return;
    const jsonStr = JSON.stringify(activeSession, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const mainPaddingLeft = sidebarOpen ? 'pl-64' : 'pl-0';

  return (
    <div className="min-h-screen bg-surface flex flex-col antialiased">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main Page Area */}
      <div className={`${mainPaddingLeft} flex-1 flex flex-col transition-all duration-300`}>
        {/* Header Bar */}
        <Header
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          sidebarOpen={sidebarOpen}
          totalFiles={documents.length}
          onExportSession={handleExportSession}
        />

        {/* Dynamic View rendering */}
        <main className="pt-16 flex-1 flex flex-col">
          {currentView === 'chat-workspace' && (
            <ChatWorkspace
              messages={activeSession.messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onSelectCitation={(cite) => setSelectedCitation(cite)}
              totalFiles={documents.length}
            />
          )}

          {currentView === 'document-library' && (
            <DocumentLibrary
              documents={documents}
              totalChunks={totalChunks}
              onUploadFile={handleUploadFile}
              onTriggerReIngest={handleTriggerReIngest}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentView === 'analytics' && <UsageAnalytics />}
        </main>
      </div>

      {/* Citation Inspector Right Drawer */}
      <CitationInspector
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};

export default App;
