import React, { useState, useRef } from 'react';
import { DocumentInfo } from '../types';

interface DocumentLibraryProps {
  documents: DocumentInfo[];
  totalChunks: number;
  onUploadFile: (file: File) => Promise<void>;
  onTriggerReIngest: () => Promise<void>;
  onDeleteDocument: (filename: string) => Promise<void>;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({
  documents,
  totalChunks,
  onUploadFile,
  onTriggerReIngest,
  onDeleteDocument
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = documents.filter((doc) =>
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSizeMb = documents.reduce((acc, d) => acc + d.size_mb, 0).toFixed(1);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setIsUploading(true);
      setStatusMessage(`Uploading and indexing '${file.name}'...`);
      await onUploadFile(file);
      setStatusMessage(`Successfully indexed '${file.name}'!`);
    } catch (err: any) {
      setStatusMessage(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setStatusMessage('Error: Only .pdf files are supported.');
        return;
      }
      try {
        setIsUploading(true);
        setStatusMessage(`Uploading and indexing '${file.name}'...`);
        await onUploadFile(file);
        setStatusMessage(`Successfully indexed '${file.name}'!`);
      } catch (err: any) {
        setStatusMessage(`Upload error: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleReIngest = async () => {
    try {
      setIsIngesting(true);
      setStatusMessage('Re-indexing vector store collection...');
      await onTriggerReIngest();
      setStatusMessage('Full collection re-ingestion completed!');
    } catch (err: any) {
      setStatusMessage(`Re-ingest failed: ${err.message}`);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="px-space-xl py-space-lg max-w-[1440px] mx-auto w-full space-y-space-lg pb-16">
      {/* Top Headline & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="space-y-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-primary font-mono text-xs">
            <span className="material-symbols-outlined text-[16px]">folder_supervised</span>
            <span>Vector Store Cluster · Local Persistent (ChromaDB)</span>
          </div>
          <h1 className="font-headline-xl text-3xl font-bold text-on-surface tracking-tight">
            Document Library
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant">
            Manage, index, and monitor corporate PDF knowledge sources for grounding high-confidence generative responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm self-start lg:self-end">
          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by filename..."
              className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          {/* Bulk Re-index CTA */}
          <button
            onClick={handleReIngest}
            disabled={isIngesting}
            className="flex items-center gap-1.5 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/40 px-3 py-2 rounded-lg text-xs font-semibold text-on-surface shadow-xs transition-colors cursor-pointer"
            type="button"
          >
            <span className={`material-symbols-outlined text-[18px] text-primary ${isIngesting ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isIngesting ? 'Re-indexing...' : 'Re-index All'}</span>
          </button>

          {/* Primary Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">file_upload</span>
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div className="bg-primary-fixed/40 border border-primary/30 p-3 rounded-xl flex items-center justify-between text-xs text-on-primary-fixed-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">info</span>
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Metrics Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Files */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Total Knowledge Base</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">library_books</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">
              {documents.length} <span className="text-xs font-normal text-outline">Files</span>
            </div>
            <p className="text-[11px] text-outline mt-0.5">{totalSizeMb} MB allocated disk</p>
          </div>
        </div>

        {/* Card 2: Indexed Vector Chunks */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Indexed Chunks</span>
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed-variant">
              <span className="material-symbols-outlined text-[18px]">grain</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">
              {totalChunks.toLocaleString()} <span className="text-xs font-normal text-outline">Vectors</span>
            </div>
            <p className="text-[11px] text-primary font-medium mt-0.5">text-embedding-3-small (1536d)</p>
          </div>
        </div>

        {/* Card 3: Indexing Health */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Indexing Health</span>
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-2xl font-bold text-on-surface">100%</span>
            </div>
            <p className="text-[11px] text-outline mt-0.5">Operational & persistent</p>
          </div>
        </div>

        {/* Card 4: Quota Utilization */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-on-surface-variant font-medium">Storage Quota</span>
            <span className="text-[11px] text-outline">Local disk</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-on-surface">{totalSizeMb} <span className="text-xs font-normal text-outline">MB</span></span>
              <span className="text-[11px] text-outline">500 MB max</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (parseFloat(totalSizeMb) / 500) * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Ingestion Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative rounded-xl bg-surface-container-low/70 hover:bg-surface-container border-2 border-dashed border-outline-variant/60 hover:border-primary transition-all duration-300 p-8 text-center cursor-pointer overflow-hidden shadow-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="relative flex flex-col items-center justify-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest text-primary shadow-sm flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all">
            <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm text-on-surface">
              Drag & drop PDF files here, or <span className="text-primary underline underline-offset-4">browse files</span>
            </p>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              Per-page text extraction, tiktoken token chunking, embedding generation, and ChromaDB vector indexing.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-outline bg-surface-container-lowest px-2.5 py-1 rounded-md shadow-xs">
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> .PDF files
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-outline bg-surface-container-lowest px-2.5 py-1 rounded-md shadow-xs">
              <span className="material-symbols-outlined text-[14px]">bolt</span> Real-time indexing
            </span>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/40 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm text-on-surface">Ingested Documents</h2>
            <span className="text-xs bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full font-mono">
              {filteredDocs.length} files
            </span>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="p-8 text-center text-xs text-outline space-y-2">
            <span className="material-symbols-outlined text-[32px]">folder_off</span>
            <p>No documents found matching query. Drop PDFs above to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 text-[11px] font-mono text-outline uppercase tracking-wider bg-surface-container-lowest">
                  <th className="py-3 px-6">Document Name</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Indexed Chunks</th>
                  <th className="py-3 px-6">File Size</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {filteredDocs.map((doc) => (
                  <tr key={doc.filename} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-on-surface flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[20px] text-primary">description</span>
                      <span className="truncate max-w-sm">{doc.filename}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-on-surface-variant">
                      {doc.chunk_count} chunks
                    </td>
                    <td className="py-3.5 px-6 font-mono text-outline">
                      {doc.size_mb} MB
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={async () => {
                          if (confirm(`Delete ${doc.filename} and remove from vector store?`)) {
                            await onDeleteDocument(doc.filename);
                          }
                        }}
                        className="p-1 rounded hover:bg-error-container hover:text-error text-outline transition-colors"
                        title="Delete Document"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
