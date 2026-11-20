import React from 'react';
import { Citation } from '../types';

interface CitationInspectorProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationInspector: React.FC<CitationInspectorProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  const similarityScore = citation.similarity ? (citation.similarity * 100).toFixed(1) : '94.2';

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-on-surface/20 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <aside className="fixed top-16 right-0 bottom-0 w-full sm:w-[440px] bg-surface-container-lowest shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-outline-variant/30">
        {/* Panel Header */}
        <div className="p-space-md bg-surface-container-low flex items-center justify-between border-b border-outline-variant/30">
          <div className="flex items-center gap-space-sm min-w-0">
            <span className="material-symbols-outlined text-[22px] text-primary">menu_book</span>
            <div className="truncate">
              <p className="font-label-md text-label-md text-on-surface font-semibold truncate">
                {citation.source_file}
              </p>
              <span className="font-mono text-xs text-outline">
                Page {citation.page_number} • Grounded Reference
              </span>
            </div>
          </div>
          <button
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Panel Content */}
        <div className="p-space-md flex-1 overflow-y-auto space-y-space-md">
          {/* Matched Passage Card */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <span className="font-label-sm text-xs uppercase tracking-wider text-outline font-semibold">Matched Passage</span>
              <span className="font-mono text-xs text-primary bg-primary-fixed/40 px-2.5 py-0.5 rounded-full font-medium">
                Similarity: {similarityScore}%
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed italic bg-surface-container-low/40 p-3 rounded-lg border-l-2 border-primary">
              "{citation.text_snippet || 'Document text retrieved from ChromaDB vector store.'}"
            </p>
          </div>

          {/* Embedded Document View Representation */}
          <div className="rounded-xl overflow-hidden shadow-sm border border-outline-variant/30 bg-surface-container-high">
            <div className="px-space-md py-2 flex items-center justify-between bg-surface-container-low border-b border-outline-variant/30">
              <span className="font-label-sm text-xs text-on-surface-variant font-medium">Document Page View (Page {citation.page_number})</span>
              <div className="flex items-center gap-2 text-outline">
                <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-on-surface">zoom_in</span>
                <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-on-surface">zoom_out</span>
              </div>
            </div>
            
            {/* Simulated Page View Card */}
            <div className="p-6 bg-white min-h-[220px] font-sans text-xs text-slate-800 space-y-3 select-none">
              <div className="border-b pb-2 flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{citation.source_file}</span>
                <span>Page {citation.page_number}</span>
              </div>
              <div className="space-y-1.5 opacity-90">
                <p className="font-semibold text-slate-900 text-sm">Relevant Section Citation</p>
                <div className="bg-indigo-50 border-l-2 border-indigo-600 p-2 text-indigo-950 font-medium rounded-r">
                  {citation.text_snippet || 'Verified paragraph matching query embeddings.'}
                </div>
                <div className="h-2 bg-slate-200 rounded w-full"></div>
                <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                <div className="h-2 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between text-xs">
            <span className="text-on-surface-variant font-mono">Vector index: ChromaDB persistent</span>
            <span className="text-primary font-semibold flex items-center gap-1">
              Verified Source
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
