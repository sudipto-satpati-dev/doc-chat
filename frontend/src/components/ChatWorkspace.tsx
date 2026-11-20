import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Citation } from '../types';
import { WelcomeState } from './WelcomeState';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string, topK: number) => void;
  isLoading: boolean;
  onSelectCitation: (citation: Citation) => void;
  totalFiles: number;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onSelectCitation,
  totalFiles
}) => {
  const [inputText, setInputText] = useState('');
  const [topK, setTopK] = useState(5);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim(), topK);
    setInputText('');
  };

  const handleInsertPrompt = (promptText: string) => {
    onSendMessage(promptText, topK);
  };

  return (
    <div className="w-full flex flex-col flex-1 pb-36">
      {/* Context Ribbon Bar */}
      <div className="w-full bg-surface-container-lowest border-b border-outline-variant/30 px-space-lg py-2 flex flex-wrap items-center justify-between gap-space-md sticky top-16 z-20">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-sm py-1 rounded-full">
            <span className="material-symbols-outlined text-[18px] text-primary">folder_open</span>
            <span className="font-label-sm text-xs text-on-surface font-semibold">Knowledge Base:</span>
            <span className="font-label-sm text-xs text-on-surface-variant truncate max-w-xs">
              Raw PDF Corpus
            </span>
            <span className="bg-primary/10 text-primary font-mono text-xs px-2 py-0.5 rounded-full font-medium">
              {totalFiles} files
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-outline">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary-container" />
            </span>
            <span>Vector Store: ChromaDB (hnsw:cosine)</span>
          </div>
        </div>

        {/* Top_K Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-on-surface-variant font-medium">Retrieval Top K:</span>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="bg-surface-container-low border border-outline-variant/40 rounded-lg px-2 py-1 font-mono text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={3}>k = 3</option>
            <option value={5}>k = 5 (Default)</option>
            <option value={8}>k = 8</option>
            <option value={10}>k = 10</option>
          </select>
        </div>
      </div>

      {/* Main Conversation or Welcome State */}
      {messages.length === 0 ? (
        <WelcomeState
          onInsertPrompt={handleInsertPrompt}
          totalFiles={totalFiles}
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              {msg.role === 'user' ? (
                /* User Bubble */
                <div className="flex flex-col items-end group">
                  <div className="flex items-end gap-2 max-w-2xl">
                    <div className="flex flex-col items-end">
                      <div className="bg-primary text-on-primary rounded-2xl rounded-br-xs px-5 py-3 shadow-sm">
                        <p className="font-body-md text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1 text-[11px] text-outline">
                        <span>{msg.timestamp}</span>
                        <span className="material-symbols-outlined text-[13px] text-primary">done_all</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Assistant Bubble */
                <div className="flex items-start gap-4 group">
                  <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                  </div>
                  <div className="flex-1 max-w-3xl space-y-3">
                    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 space-y-4">
                      {/* Assistant Text Content */}
                      <div className="font-body-md text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>

                      {/* Citations Section */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-3 border-t border-outline-variant/20 bg-surface-container-low/50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5 text-outline font-mono text-[11px] uppercase tracking-wider font-semibold">
                              <span className="material-symbols-outlined text-[16px]">library_books</span>
                              <span>Verified Citations ({msg.citations.length})</span>
                            </div>
                            <span className="text-[11px] text-primary font-medium">Click chip to inspect passage</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((cite, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => onSelectCitation(cite)}
                                className="group inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-primary-fixed/50 border border-outline-variant/40 hover:border-primary px-3 py-1 rounded-full transition-all cursor-pointer shadow-xs"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[15px] text-primary group-hover:scale-110 transition-transform">
                                  description
                                </span>
                                <span className="font-medium text-xs text-on-surface group-hover:text-primary transition-colors">
                                  {cite.source_file}
                                </span>
                                <span className="font-mono text-[11px] bg-primary/10 text-primary px-1.5 py-0.2 rounded-full font-semibold">
                                  p. {cite.page_number}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/30 flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-mono text-outline">Searching ChromaDB vectors & generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Floating Bottom Chat Input Box - Always Visible */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-gradient-to-t from-surface via-surface to-transparent pointer-events-none z-30">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-lg p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about your uploaded PDF documents..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-40 text-on-primary flex items-center justify-center transition-colors shadow-sm cursor-pointer shrink-0"
              title="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
          <div className="flex items-center justify-between px-3 mt-1.5 text-[11px] text-outline font-mono">
            <span>Grounding: 100% Document Verified</span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
};
